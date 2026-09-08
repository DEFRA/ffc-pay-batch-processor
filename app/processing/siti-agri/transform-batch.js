const { parseInteger, parseFloatValue } = require('../numeric-parse-helpers')

const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[1],
    numberOfPaymentRequests: parseInteger(batchHeader[2]),
    batchValue: parseFloatValue(batchHeader[3]),
    sequence: parseInteger(batchHeader[4]),
    sourceSystem: batchHeader[5],
    ledger: batchHeader[6]
  }
}

module.exports = transformBatch
