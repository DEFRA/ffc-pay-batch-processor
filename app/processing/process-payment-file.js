const blobStorage = require('../storage')
const batches = require('./batch')
const reprocessIfNeeded = require('./reprocess-if-needed')
const downloadAndParse = require('./download-and-parse')
const { sendBatchErrorEvent } = require('../event')
const validateSequence = require('./validate-sequence')

const processPaymentFile = async (filename, scheme) => {
  try {
    console.log(`Processing ${filename}`)
    const reprocessed = await reprocessIfNeeded(filename, scheme)

    if (!reprocessed) {
      await processIfValid(scheme, filename)
    }
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.error(`Error thrown processing ${filename}`)
    console.error(err)
  }
}

const processIfValid = async (scheme, filename) => {
  const { success: sequenceValidationSuccess, currentSequence, expectedSequence } = await validateSequence(scheme.schemeId, filename)

  if (sequenceValidationSuccess) {
    await batches.create(filename, currentSequence, scheme.schemeId)
    await downloadAndParse(filename, scheme, currentSequence)
  } else if (currentSequence > expectedSequence) {
    console.log(`Ignoring ${filename}, expected sequence id ${expectedSequence} and current sequence is ${currentSequence}`)
  } else {
    currentSequence < expectedSequence
      ? console.log(`Quarantining ${filename}, sequence id ${currentSequence} below expected ${expectedSequence}`)
      : console.log(`Quarantining ${filename}, unable to get expected sequence id from database`)

    await blobStorage.quarantinePaymentFile(filename, filename)
  }
}

module.exports = processPaymentFile
