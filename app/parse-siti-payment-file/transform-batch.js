const transformBatch = (batchData) => {
  const batchValue = parseFloat(batchData[3])
  const numberOfInvoices = parseFloat(batchData[2])

  return {
    exportDate: batchData[1],
    numberOfInvoices,
    batchValue,
    batchId: batchData[4],
    creatorId: batchData[5],
    invoiceType: batchData[6]
  }
}

module.exports = transformBatch
