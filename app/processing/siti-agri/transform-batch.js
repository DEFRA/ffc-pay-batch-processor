const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[1],
    numberOfPaymentRequests: !isNaN(batchHeader[2]) ? parseInt(batchHeader[2]) : undefined,
    batchValue: !isNaN(batchHeader[3]) ? parseFloat(batchHeader[3]) : undefined,
    sequence: !isNaN(batchHeader[4]) ? parseInt(batchHeader[4]) : undefined,
    sourceSystem: batchHeader[5],
    ledger: batchHeader[6]
  }
}

module.exports = transformBatch
