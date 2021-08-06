const blobStorage = require('../blob-storage')
const pollingInterval = require('../config/polling').pollingInterval
const { parsePaymentFile, parseFilename, filenameMasks } = require('../parse-siti-payment-file')
const batches = require('./batches')

const processPaymentFile = async (fileName, schemeType) => {
  console.log(`Processing ${fileName}`)
  const expectedSequenceId = await batches.nextSequenceId(schemeType.scheme)
  const currentSequenceId = Number(schemeType.batchId)

  if (currentSequenceId === expectedSequenceId) {
    await batches.create(fileName, schemeType.batchId, schemeType.scheme)

    const buffer = await blobStorage.downloadPaymentFile(fileName)
    const parseSuccess = await parsePaymentFile(buffer, schemeType.batchId)

    if (parseSuccess) {
      console.log(`Archiving ${fileName}, successfully parsed file`)
      await blobStorage.archivePaymentFile(fileName, fileName)
      await batches.updateStatus(fileName, batches.status.success)
    } else {
      console.log(`Quarantining ${fileName}, failed to parse file`)
      await blobStorage.quarantinePaymentFile(fileName, fileName)
      await batches.updateStatus(fileName, batches.status.failed)
    }
  } else if (currentSequenceId > expectedSequenceId) {
    console.log(`Ignoring ${fileName}, expected sequence id: ${expectedSequenceId}`)
  } else {
    currentSequenceId < expectedSequenceId
      ? console.log(`Quarantining ${fileName}, sequence id: ${currentSequenceId} already processed`)
      : console.log(`Quarantining ${fileName}, unable to get expected sequence id from database`)

    await blobStorage.quarantinePaymentFile(fileName, fileName)
  }
}

async function checkAzureStorage () {
  console.log('Checking Azure Storage')
  const fileNameList = await blobStorage.getInboundFileList()

  if (fileNameList.length > 0) {
    console.log(`Found files to process ${fileNameList}`)

    for (const fileName of fileNameList) {
      const schemeType = parseFilename(fileName, filenameMasks.sfi)

      if (schemeType.scheme === 'SITIELM') {
        await processPaymentFile(fileName, schemeType)
      } else {
        console.log(`Ignoring ${fileName}, scheme ${schemeType.scheme} not recognised`)
      }
    }
  }

  setTimeout(checkAzureStorage, pollingInterval)
}

module.exports = checkAzureStorage
