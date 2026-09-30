const { getSourceSystems } = require('ffc-pay-schemes')

const { IMPS } = getSourceSystems()

const sequenceIndex = 2
const numberOfPRsIndex = 3
const batchValueIndex = 5

const transformBatch = (batchHeader) => {
  return {
    sequence: !Number.isNaN(batchHeader[sequenceIndex]) ? Number.parseInt(batchHeader[sequenceIndex]) : undefined,
    numberOfPaymentRequests: !Number.isNaN(batchHeader[numberOfPRsIndex]) ? Number.parseInt(batchHeader[numberOfPRsIndex]) : undefined,
    batchValue: !Number.isNaN(batchHeader[batchValueIndex]) ? Number.parseFloat(batchHeader[batchValueIndex]) : undefined,
    sourceSystem: IMPS
  }
}

module.exports = transformBatch
