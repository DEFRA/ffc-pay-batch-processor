const transformBatch = (batchHeader) => {
  return {
    exportDate: batchHeader[1],
    numberOfPaymentRequests: Number(batchHeader[2]),
    batchValue: parseFloat(batchHeader[3]),
    sequence: batchHeader[4],
    sourceSystem: batchHeader[5],
    ledger: batchHeader[6]
  }
}

module.exports = transformBatch
