const blobStorage = require('../storage')
const batch = require('./batch')
const downloadAndParse = require('./download-and-parse')
const quarantineFile = require('./quarantine-file')
const validateSequence = require('./validate-sequence')

const processIfValid = async (scheme, filename) => {
  const { success: sequenceValidationSuccess, currentSequence, expectedSequence } = await validateSequence(scheme.schemeId, filename)

  if (sequenceValidationSuccess) {
    await batch.create(filename, currentSequence, scheme.schemeId)
    await downloadAndParse(filename, scheme, currentSequence)
  } else if (currentSequence > expectedSequence) {
    console.log(`Ignoring ${filename}, expected sequence id ${expectedSequence} and current sequence is ${currentSequence}`)
  } else {
    currentSequence < expectedSequence
      ? console.log(`Quarantining ${filename}, sequence id ${currentSequence} below expected ${expectedSequence}`)
      : console.log(`Quarantining ${filename}, unable to get expected sequence id from database`)

    await quarantineFile(filename)
  }
}

module.exports = processIfValid
