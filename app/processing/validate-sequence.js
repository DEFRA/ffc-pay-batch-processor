const { disableSequenceValidation } = require('../config/processing')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, es, fc, imps, sfi23, delinked, combinedOffer, cohtCapital } = require('../constants/schemes')
const batch = require('./batch')
const SEQUENCE_LENGTH = 4
const SFI_SEQUENCE_START = 7
const LUMP_SUMS_SEQUENCE_START = 8
const DELINKED_CS_SEQUENCE_START = 6
const BPS_FDMR_FC_CO_SEQUENCE_START = 5
const ES_SEQUENCE_START = 23
const IMPS_OFFSET = 1
const COHT_CAPITAL_SEQUENCE_START = 9

const validateSequence = async (schemeId, filename) => {
  const sequence = getSequence(schemeId, filename)
  return isSequenceValid(schemeId, sequence)
}

const getSequence = (schemeId, filename) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
      return Number(filename.substr(SFI_SEQUENCE_START, SEQUENCE_LENGTH))
    case lumpSums.schemeId:
    case sfi23.schemeId:
      return Number(filename.substr(LUMP_SUMS_SEQUENCE_START, SEQUENCE_LENGTH))
    case cs.schemeId:
    case delinked.schemeId:
      return Number(filename.substr(DELINKED_CS_SEQUENCE_START, SEQUENCE_LENGTH))
    case bps.schemeId:
    case fdmr.schemeId:
    case fc.schemeId:
    case combinedOffer.schemeId:
      return Number(filename.substr(BPS_FDMR_FC_CO_SEQUENCE_START, SEQUENCE_LENGTH))
    case es.schemeId:
      return Number(filename.substr(ES_SEQUENCE_START, SEQUENCE_LENGTH))
    case imps.schemeId:
      return Number(filename.substring(filename.lastIndexOf('_') + IMPS_OFFSET, filename.lastIndexOf('.')))
    case cohtCapital.schemeId:
      return Number(filename.substr(COHT_CAPITAL_SEQUENCE_START, SEQUENCE_LENGTH))
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
