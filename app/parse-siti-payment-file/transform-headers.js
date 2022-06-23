const { SFI, SFI_PILOT, LUMP_SUMS } = require('../schemes')

const transformHeaders = (headerData, scheme) => {
  switch (scheme) {
    case SFI:
    case SFI_PILOT:
      return transformSFIHeader(headerData)
    case LUMP_SUMS:
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
  sourceSystem: headerData[10],
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

module.exports = transformHeaders
