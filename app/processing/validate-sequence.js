const { getBatchSequenceFromFileName } = require('ffc-pay-schemes')
const { disableSequenceValidation } = require('../config/processing')
const batch = require('./batch')

const validateSequence = async (schemeId, filename) => {
  const sequence = getBatchSequenceFromFileName(schemeId, filename)
  return isSequenceValid(schemeId, sequence)
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
  if (disableSequenceValidation) {
    return true
  }
  return currentSequence === expectedSequence
}

module.exports = validateSequence
