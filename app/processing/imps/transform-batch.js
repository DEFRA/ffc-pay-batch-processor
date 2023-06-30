const { imps } = require('../../constants/schemes')

const transformBatch = (batchHeader) => {
  return {
    sequence: !isNaN(batchHeader[2]) ? parseInt(batchHeader[2]) : undefined,
    numberOfPaymentRequests: !isNaN(batchHeader[3]) ? parseInt(batchHeader[3]) : undefined,
    batchValue: !isNaN(batchHeader[5]) ? parseFloat(batchHeader[5]) : undefined,
    sourceSystem: imps.sourceSystem
  }
}

module.exports = transformBatch
