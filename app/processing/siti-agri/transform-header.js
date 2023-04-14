const { v4: uuidv4 } = require('uuid')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr } = require('../../schemes')

const transformHeader = (headerData, schemeId, filename) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
      return transformSFIHeader(headerData, filename)
    case lumpSums.schemeId:
      return transformLumpSumsHeader(headerData, filename)
    case bps.schemeId:
    case fdmr.schemeId:
      return transformBPSHeader(headerData, filename)
    case cs.schemeId:
      return transformCSHeader(headerData, filename)
    default:
      throw new Error(`Unknown scheme: ${schemeId}`)
  }
}

const transformSFIHeader = (headerData, filename) => ({
  correlationId: uuidv4(),
  batch: filename,
  invoiceNumber: headerData[1],
  paymentRequestNumber: !isNaN(headerData[2]) ? parseInt(headerData[2]) : undefined,
  contractNumber: headerData[3],
  frn: headerData[5],
  currency: headerData[6],
  value: !isNaN(headerData[7]) ? parseFloat(headerData[7]) : undefined,
  deliveryBody: headerData[8],
  schedule: headerData[11],
  invoiceLines: []
})

const transformLumpSumsHeader = (headerData, filename) => ({
  correlationId: uuidv4(),
  batch: filename,
  invoiceNumber: headerData[1],
  paymentRequestNumber: !isNaN(headerData[2]) ? parseInt(headerData[2]) : undefined,
  contractNumber: headerData[3],
  frn: headerData[4],
  currency: headerData[8],
  value: !isNaN(headerData[6]) ? parseFloat(headerData[6]) : undefined,
  deliveryBody: headerData[7],
  invoiceLines: []
})

const transformBPSHeader = (headerData, filename) => ({
  correlationId: uuidv4(),
  batch: filename,
  invoiceNumber: headerData[1],
  paymentRequestNumber: !isNaN(headerData[2]) ? parseInt(headerData[2]) : undefined,
  contractNumber: headerData[3],
  frn: headerData[4],
  value: !isNaN(headerData[6]) ? parseFloat(headerData[6]) : undefined,
  deliveryBody: headerData[7],
  currency: headerData[8],
  invoiceLines: []
})

const transformCSHeader = (headerData, filename) => ({
  correlationId: uuidv4(),
  batch: filename,
  invoiceNumber: headerData[1],
  paymentRequestNumber: !isNaN(headerData[2]) ? parseInt(headerData[2]) : undefined,
  contractNumber: headerData[3],
  paymentType: !isNaN(headerData[4]) ? parseInt(headerData[4]) : undefined,
  frn: headerData[5],
  currency: headerData[6],
  value: !isNaN(headerData[7]) ? parseFloat(headerData[7]) : undefined,
  deliveryBody: headerData[8],
  invoiceLines: []
})

module.exports = transformHeader
