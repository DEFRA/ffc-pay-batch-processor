const { randomUUID } = require('node:crypto')

const transformHeader = (headerData, schemeId, filename) => {
  return {
    correlationId: randomUUID(),
    batch: filename,
    schemeId,
    invoiceNumber: headerData[1],
    paymentRequestNumber: 1,
    contractNumber: headerData[2],
    vendor: headerData[4],
    marketingYear: headerData[6],
    value: !Number.isNaN(headerData[7]) ? Number.parseFloat(headerData[7]) : undefined,
    invoiceLines: []
  }
}

module.exports = transformHeader
