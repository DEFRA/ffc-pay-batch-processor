const batches = require('./batches')
const reprocessIfNeeded = require('./reprocess-if-needed')
const downloadAndParse = require('./download-and-parse')
const { sendBatchErrorEvent } = require('../event')
const { disableSequenceValidation } = require('../config/processing')
const quarantineFile = require('../process-batches/quarantine-file')

async function processPaymentFile (filename, schemeType) {
  try {
    console.log(`Processing ${filename}`)
    const reprocessed = await reprocessIfNeeded(filename, schemeType)

    if (!reprocessed) {
      await processIfValid(schemeType, filename)
    }
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.error(`Error thrown processing ${filename}`)
    console.error(err)
  }
}

async function processIfValid (schemeType, filename) {
  const { success: sequenceValidationSuccess, currentSequenceId, expectedSequenceId } = await isSequenceValid(schemeType.scheme, schemeType.batchId)

  if (sequenceValidationSuccess) {
    await batches.create(filename, schemeType.batchId, schemeType.scheme)
    await downloadAndParse(filename, schemeType)
  } else if (currentSequenceId > expectedSequenceId) {
    console.log(`Ignoring ${filename}, expected sequence id ${expectedSequenceId} and current sequence is ${currentSequenceId}`)
  } else {
    currentSequenceId < expectedSequenceId
      ? console.log(`Quarantining ${filename}, sequence id ${currentSequenceId} below expected ${expectedSequenceId}`)
      : console.log(`Quarantining ${filename}, unable to get expected sequence id from database`)

    await quarantineFile(filename)
  }
}

async function isSequenceValid (scheme, batchId) {
  const expectedSequenceId = await batches.nextSequenceId(scheme)
  const currentSequenceId = Number(batchId)
  const success = doesSequenceMatch(expectedSequenceId, currentSequenceId)
  return {
    success,
    currentSequenceId,
    expectedSequenceId
  }
}

function doesSequenceMatch (expectedSequenceId, currentSequenceId) {
  if (disableSequenceValidation) {
    return true
  }
  return currentSequenceId === expectedSequenceId
}

module.exports = processPaymentFile
