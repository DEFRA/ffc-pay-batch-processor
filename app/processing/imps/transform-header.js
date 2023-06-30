const { v4: uuidv4 } = require('uuid')

const transformHeader = (headerData, filename) => {
  return {
    correlationId: uuidv4(),
    batch: filename,
    paymentRequestNumber: 1,
    transactionType: headerData[3],
    ledger: headerData[4],
    trader: headerData[5],
    invoiceNumber: headerData[6],
    contractNumber: headerData[6],
    invoiceLines: []
  }
}

module.exports = transformHeader
