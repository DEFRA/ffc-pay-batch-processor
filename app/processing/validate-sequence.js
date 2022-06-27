const batch = require('./batch')
const { disableSequenceValidation } = require('../config/processing')
const { sfi, sfiPilot, lumpSums } = require('../schemes')

const validateSequence = async (schemeId, filename) => {
  const sequence = getSequence(schemeId, filename)
  return isSequenceValid(schemeId, sequence)
}

const getSequence = (schemeId, filename) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
      return Number(filename.substr(7, 4))
    case lumpSums.schemeId:
      return Number(filename.substr(9, 4))
    default:
      throw new Error(`Unknown schemeId: ${schemeId}`)
  }
}

const isSequenceValid = async (schemeId, sequence) => {
  const expectedSequence = await batch.nextSequenceId(schemeId)
  const currentSequence = sequence
  const success = doesSequenceMatch(expectedSequence, currentSequence)
  return {
    success,
    currentSequence,
    expectedSequence
  }
}

const doesSequenceMatch = (expectedSequence, currentSequence) => {
  console.log(disableSequenceValidation)
  if (disableSequenceValidation) {
    return true
  }
  return currentSequence === expectedSequence
}

module.exports = validateSequence
