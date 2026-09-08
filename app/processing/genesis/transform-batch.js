const { getSourceSystems } = require('ffc-pay-schemes')

const { ES } = getSourceSystems()

const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[1],
    numberOfPaymentRequests: !Number.isNaN(batchHeader[2]) ? Number.parseInt(batchHeader[2]) : undefined,
    batchValue: !Number.isNaN(batchHeader[4]) ? Number.parseFloat(batchHeader[4]) : undefined,
    sequence: !Number.isNaN(batchHeader[5]) ? Number.parseInt(batchHeader[5]) : undefined,
    sourceSystem: ES
  }
}

module.exports = transformBatch
