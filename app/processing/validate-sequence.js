const { disableSequenceValidation } = require('../config/processing')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, es, fc, imps, sfi23, delinked, sfiExpanded } = require('../constants/schemes')
const batch = require('./batch')

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
    case sfi23.schemeId:
      return Number(filename.substr(8, 4))
    case cs.schemeId:
    case delinked.schemeId:
      return Number(filename.substr(6, 4))
    case bps.schemeId:
    case fdmr.schemeId:
    case fc.schemeId:
    case sfiExpanded.schemeId:
      return Number(filename.substr(5, 4))
    case es.schemeId:
      return Number(filename.substr(23, 4))
    case imps.schemeId:
      return Number(filename.substring(filename.lastIndexOf('_') + 1, filename.lastIndexOf('.')))
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
  if (disableSequenceValidation) {
    return true
  }
  return currentSequence === expectedSequence
}

module.exports = validateSequence
