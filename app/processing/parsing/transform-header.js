const { sfi, sfiPilot, lumpSums } = require('../../schemes')

const transformHeader = (headerData, schemeId) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
      return transformSFIHeader(headerData)
    case lumpSums.schemeId:
      return transformLumpSumsHeader(headerData)
    default:
      throw new Error('Unknown scheme')
  }
}

const transformSFIHeader = (headerData) => ({
  invoiceNumber: headerData[1],
  paymentRequestNumber: parseInt(headerData[2]),
  contractNumber: headerData[3],
  frn: headerData[5],
  currency: headerData[6],
  value: parseFloat(headerData[7]),
  deliveryBody: headerData[8],
  schedule: headerData[11],
  invoiceLines: []
})

const transformLumpSumsHeader = (headerData) => ({
  invoiceNumber: headerData[1],
  paymentRequestNumber: parseInt(headerData[2]),
  contractNumber: headerData[3],
  frn: headerData[4],
  value: parseFloat(headerData[6]),
  deliveryBody: headerData[7],
  currency: headerData[8],
  invoiceLines: []
})

module.exports = transformHeader
