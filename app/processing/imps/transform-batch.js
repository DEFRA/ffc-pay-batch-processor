const { es } = require('../../constants/schemes')

const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[1],
    numberOfPaymentRequests: !isNaN(batchHeader[2]) ? parseInt(batchHeader[2]) : undefined,
    batchValue: !isNaN(batchHeader[4]) ? parseFloat(batchHeader[4]) : undefined,
    sequence: !isNaN(batchHeader[5]) ? parseInt(batchHeader[5]) : undefined,
    sourceSystem: es.sourceSystem
  }
}

module.exports = transformBatch
