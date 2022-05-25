const blobStorage = require('../blob-storage')
const batches = require('./batches')
const reprocessIfNeeded = require('./reprocess-if-needed')
const downloadAndParse = require('./download-and-parse')
const { sendBatchErrorEvent } = require('../event')

async function processPaymentFile (filename, schemeType) {
  try {
    console.log(`Processing ${filename}`)
    const reprocessed = await reprocessIfNeeded(filename, schemeType)

    if (!reprocessed) {
      await checkSequenceAndPerfomAction(schemeType, filename)
    }
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.error(`Error thrown processing ${filename}`)
    console.error(err)
  }
}

async function checkSequenceAndPerfomAction (schemeType, filename) {
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

module.exports = processPaymentFile
