const batch = require('./batch')
const processingConfig = require('../config/processing')
const storage = require('../storage')
const fileProcessingFailed = require('./file-processing-failed')
const downloadAndParse = require('./download-and-parse')

const reprocessIfNeeded = async (filename, scheme) => {
  const existingBatch = await batch.exists(filename)

  if (existingBatch) {
    console.log(`${filename} already exists in database`)
    switch (existingBatch.statusId) {
      case batch.status.inProgress:
        await reprocess(filename, existingBatch, scheme)
        break
      case batch.status.success:
        await success(filename)
        break
      case batch.status.failed:
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

const reprocess = async (filename, existingBatch, scheme) => {
  console.log('In progress status set, re-try processing')
  console.log(`Tried processing ${existingBatch.processingTries} times already`)

  if (existingBatch.processingTries >= processingConfig.maxProcessingTries) {
    console.log('Reached max re-tries, failed to process, quarantining')
    await fileProcessingFailed(filename)
  } else {
    await batch.incrementProcessingTries(filename)
    await downloadAndParse(filename, scheme, existingBatch.sequenceNumber)
  }
}

const success = async (filename) => {
  console.log('Previous processing success status set, archiving')
  await storage.archivePaymentFile(filename, filename)
}

const failed = async (filename) => {
  console.log('Previous processing failure status set, quarantining')
  await storage.quarantinePaymentFile(filename, filename)
}

const unknown = async (filename) => {
  console.log('Previous processing unknown status set, quarantining')
  await fileProcessingFailed(filename)
}

module.exports = reprocessIfNeeded
