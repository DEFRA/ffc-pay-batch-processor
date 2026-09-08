const { getSourceSystems } = require('ffc-pay-schemes')

const { IMPS } = getSourceSystems()

const transformBatch = (batchHeader) => {
  return {
    sequence: !Number.isNaN(batchHeader[2]) ? Number.parseInt(batchHeader[2]) : undefined,
    numberOfPaymentRequests: !Number.isNaN(batchHeader[3]) ? Number.parseInt(batchHeader[3]) : undefined,
    batchValue: !Number.isNaN(batchHeader[5]) ? Number.parseFloat(batchHeader[5]) : undefined,
    sourceSystem: IMPS
  }
}

module.exports = transformBatch
