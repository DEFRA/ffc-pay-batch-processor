const { parseInteger, parseFloatValue } = require('../numeric-parse-helpers')

const exportDateIndex = 1
const numberOfPRsIndex = 2
const batchValueIndex = 3
const sequenceIndex = 4
const sourceSystemIndex = 5
const ledgerIndex = 6

const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[exportDateIndex],
    numberOfPaymentRequests: parseInteger(batchHeader[numberOfPRsIndex]),
    batchValue: parseFloatValue(batchHeader[batchValueIndex]),
    sequence: parseInteger(batchHeader[sequenceIndex]),
    sourceSystem: batchHeader[sourceSystemIndex],
    ledger: batchHeader[ledgerIndex]
  }
}

module.exports = transformBatch
