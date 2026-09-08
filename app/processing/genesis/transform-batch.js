const { getSourceSystems } = require('ffc-pay-schemes')

const { ES } = getSourceSystems()

const exportDateIndex = 1
const numberOfPRsIndex = 2
const batchValueIndex = 4
const sequenceIndex = 5

const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[exportDateIndex],
    numberOfPaymentRequests: !Number.isNaN(batchHeader[numberOfPRsIndex]) ? Number.parseInt(batchHeader[numberOfPRsIndex]) : undefined,
    batchValue: !Number.isNaN(batchHeader[batchValueIndex]) ? Number.parseFloat(batchHeader[batchValueIndex]) : undefined,
    sequence: !Number.isNaN(batchHeader[sequenceIndex]) ? Number.parseInt(batchHeader[sequenceIndex]) : undefined,
    sourceSystem: ES
  }
}

module.exports = transformBatch
