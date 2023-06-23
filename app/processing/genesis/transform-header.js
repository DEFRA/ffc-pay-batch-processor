const { v4: uuidv4 } = require('uuid')
const { GBP } = require('../../constants/currency')

const transformHeader = (headerData, schemeId, filename) => {
  return {
    correlationId: uuidv4(),
    batch: filename,
    invoiceNumber: headerData[1],
    paymentRequestNumber: 1,
    contractNumber: headerData[2],
    vendor: headerData[4],
    currency: GBP,
    marketingYear: headerData[6],
    value: !isNaN(headerData[7]) ? parseFloat(headerData[7]) : undefined,
    invoiceLines: []
  }
}

module.exports = transformHeader
