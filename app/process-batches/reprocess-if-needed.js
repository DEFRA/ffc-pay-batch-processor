const batches = require('./batches')
const processingConfig = require('../config/processing')
const blobStorage = require('../blob-storage')
const fileProcessingFailed = require('./file-processing-failed')
const downloadAndParse = require('./download-and-parse')
const quarantineFile = require('./quarantine-file')

async function reprocessIfNeeded (filename, schemeType) {
  const batch = await batches.exists(filename)

  if (batch) {
    console.log(`${filename} already exists in database`)
    switch (batch.statusId) {
      case batches.status.inProgress:
        await inProgress(filename, batch, schemeType)
        break
      case batches.status.success:
        await success(filename)
        break
      case batches.status.failed:
        await failed(filename)
        break
      default:
        await unknown(filename)
        break
    }

    return true
  }

  return false
}

async function inProgress (filename, batch, schemeType) {
  console.log('In progress status set, re-try processing')
  console.log(`Tried processing ${batch.processingTries} times already`)

  if (batch.processingTries >= processingConfig.maxProcessingTries) {
    console.log('Reached max re-tries, failed to process, quarantining')
    await fileProcessingFailed(filename)
  } else {
    await batches.incrementProcessingTries(filename)
    await downloadAndParse(filename, schemeType)
  }
}

async function success (filename) {
  console.log('Previous processing success status set, archiving')
  await blobStorage.archivePaymentFile(filename, filename)
}

async function failed (filename) {
  console.log('Previous processing failure status set, quarantining')
  await quarantineFile(filename)
}

async function unknown (filename) {
  console.log('Previous processing unknown status set, quarantining')
  await fileProcessingFailed(filename)
}

module.exports = reprocessIfNeeded
