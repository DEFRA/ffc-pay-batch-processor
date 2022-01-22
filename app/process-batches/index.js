const blobStorage = require('../blob-storage')
const processingConfig = require('../config/processing')
const { parsePaymentFile, parseFilename } = require('../parse-siti-payment-file')
const batches = require('./batches')

async function fileProcessingFailed (filename) {
  await batches.updateStatus(filename, batches.status.failed)
  await blobStorage.quarantinePaymentFile(filename, filename)
}

async function downloadAndParse (filename, schemeType) {
  const buffer = await blobStorage.downloadPaymentFile(filename)
  const parseSuccess = await parsePaymentFile(buffer, schemeType.batchId)

  if (parseSuccess) {
    console.log(`Archiving ${filename}, successfully parsed file`)
    await batches.updateStatus(filename, batches.status.success)
    await blobStorage.archivePaymentFile(filename, filename)
  } else {
    console.log(`Quarantining ${filename}, failed to parse file`)
    fileProcessingFailed(filename)
  }
}

async function reprocessIfNeeded (filename, schemeType) {
  const batch = await batches.exists(filename)

  if (batch) {
    console.log(`${filename} already exists in database`)

    switch (batch.statusId) {
      case batches.status.inProgress:
        console.log('In progress status set, re-try processing')
        console.log(`Tried processing ${batch.processingTries} times already`)

        if (batch.processingTries >= processingConfig.maxProcessingTries) {
          console.log('Reached max re-tries, failed to process, quarantining')
          await fileProcessingFailed(filename)
        } else {
          await batches.incrementProcessingTries(filename)
          await downloadAndParse(filename, schemeType)
        }

        break
      case batches.status.success:
        console.log('Previous processing success status set, archiving')
        await blobStorage.archivePaymentFile(filename, filename)
        break
      case batches.status.failed:
        console.log('Previous processing failure status set, quarantining')
        await blobStorage.quarantinePaymentFile(filename, filename)
        break
      default:
        console.log('Previous processing unknown status set, quarantining')
        await fileProcessingFailed(filename)
        break
    }
  } else {
    return false
  }

  return true
}

async function processPaymentFile (filename, schemeType) {
  try {
    console.log(`Processing ${filename}`)
    const reprocessed = await reprocessIfNeeded(filename, schemeType)

    if (!reprocessed) {
      const expectedSequenceId = await batches.nextSequenceId(schemeType.scheme)
      const currentSequenceId = Number(schemeType.batchId)

      if (currentSequenceId === expectedSequenceId) {
        await batches.create(filename, schemeType.batchId, schemeType.scheme)
        await downloadAndParse(filename, schemeType)
      } else if (currentSequenceId > expectedSequenceId) {
        console.log(`Ignoring ${filename}, expected sequence id ${expectedSequenceId}`)
      } else {
        currentSequenceId < expectedSequenceId
          ? console.log(`Quarantining ${filename}, sequence id ${currentSequenceId} below expected`)
          : console.log(`Quarantining ${filename}, unable to get expected sequence id from database`)

        await blobStorage.quarantinePaymentFile(filename, filename)
      }
    }
  } catch (err) {
    console.error(`Error thrown processing ${filename}`)
    console.error(err)
  }
}

async function checkAzureStorage () {
  const filenameList = await blobStorage.getInboundFileList()

  if (filenameList.length > 0) {
    console.log(`Found files to process ${filenameList}`)

    for (const filename of filenameList) {
      const schemeType = parseFilename(filename)

      if (schemeType) {
        console.log(`Identified scheme as ${schemeType.scheme}`)
        await processPaymentFile(filename, schemeType)
      } else {
        console.log(`Ignoring ${filename}, scheme not recognised`)
      }
    }
  }

  setTimeout(checkAzureStorage, processingConfig.pollingInterval)
}

module.exports = checkAzureStorage
