const { randomUUID } = require('node:crypto')

const transformHeader = (headerData, schemeId, filename) => {
  return {
    correlationId: randomUUID(),
    schemeId,
    batch: filename,
    paymentRequestNumber: 1,
    ledger: headerData[4],
    trader: headerData[5],
    invoiceNumber: headerData[6],
    contractNumber: headerData[6],
    invoiceLines: []
  }
}

module.exports = transformHeader
