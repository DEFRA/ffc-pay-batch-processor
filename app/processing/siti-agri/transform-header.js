const { v4: uuidv4 } = require('uuid')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, sfi23, delinked, combinedOffer, cohtCapital } = require('../../constants/schemes')
const combinedOfferSchemes = require('../../constants/combined-offer-schemes')
// common header indexes
const HEADER_INVOICE_NO = 1
const HEADER_PAYMENT_REQUEST_NO = 2
const HEADER_CONTRACT_NO = 3

const SFI_CS_HEADER_FRN = 5
const SFI_CS_HEADER_CURRENCY = 6
const SFI_CS_HEADER_VALUE = 7
const SFI_CS_HEADER_DELIVERY_BODY = 8
const SFI_HEADER_SOURCE_SYSTEM = 10
const SFI_HEADER_SCHEDULE = 11
const CS_HEADER_PAYMENT_TYPE = 4

const LUMP_BPS_HEADER_FRN = 4
const LUMP_BPS_HEADER_VALUE = 6
const LUMP_BPS_HEADER_DELIVERY_BODY = 7
const LUMP_BPS_HEADER_CURRENCY = 8

const transformHeader = (headerData, schemeId, filename) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
    case sfi23.schemeId:
    case delinked.schemeId:
    case combinedOffer.schemeId:
      return transformSFIOrDPHeader(headerData, schemeId, filename)
    case lumpSums.schemeId:
      return transformLumpSumsHeader(headerData, schemeId, filename)
    case bps.schemeId:
    case fdmr.schemeId:
      return transformBPSHeader(headerData, schemeId, filename)
    case cs.schemeId:
      return transformCSHeader(headerData, schemeId, filename)
    case cohtCapital.schemeId:
      return transformSFIOrDPHeader(headerData, schemeId, filename)
    default:
      throw new Error(`Unknown scheme: ${schemeId}`)
  }
}

const getSchemeId = (headerData, schemeId) => {
  const sourceSystem = headerData[SFI_HEADER_SOURCE_SYSTEM]
  if (sourceSystem === combinedOfferSchemes.csHigherTier.sourceSystem) {
    return combinedOfferSchemes.csHigherTier.schemeId
  }
  // default to first schemeId of combined offer (SFI Expanded - 14)
  return schemeId
}

const transformSFIOrDPHeader = (headerData, schemeId, filename) => {
  const headerItems = {
    correlationId: uuidv4(),
    schemeId: schemeId === combinedOffer.schemeId ? getSchemeId(headerData, schemeId) : schemeId,
    batch: filename,
    invoiceNumber: headerData[HEADER_INVOICE_NO],
    paymentRequestNumber: !isNaN(headerData[HEADER_PAYMENT_REQUEST_NO]) ? parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]) : undefined,
    contractNumber: headerData[HEADER_CONTRACT_NO],
    frn: headerData[SFI_CS_HEADER_FRN],
    currency: headerData[SFI_CS_HEADER_CURRENCY],
    value: !isNaN(headerData[SFI_CS_HEADER_VALUE]) ? parseFloat(headerData[SFI_CS_HEADER_VALUE]) : undefined,
    deliveryBody: headerData[SFI_CS_HEADER_DELIVERY_BODY],
    schedule: headerData[SFI_HEADER_SCHEDULE],
    invoiceLines: []
  }

  if (schemeId === cohtCapital.schemeId) {
    delete headerItems.schedule
  }

  return headerItems
}

const transformLumpSumsHeader = (headerData, schemeId, filename) => ({
  correlationId: uuidv4(),
  schemeId,
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

const transformBPSHeader = (headerData, schemeId, filename) => ({
  correlationId: uuidv4(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: !isNaN(headerData[HEADER_PAYMENT_REQUEST_NO]) ? parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]) : undefined,
  contractNumber: headerData[HEADER_CONTRACT_NO],
  frn: headerData[LUMP_BPS_HEADER_FRN],
  value: !isNaN(headerData[LUMP_BPS_HEADER_VALUE]) ? parseFloat(headerData[LUMP_BPS_HEADER_VALUE]) : undefined,
  deliveryBody: headerData[LUMP_BPS_HEADER_DELIVERY_BODY],
  currency: headerData[LUMP_BPS_HEADER_CURRENCY],
  invoiceLines: []
})

const transformCSHeader = (headerData, schemeId, filename) => ({
  correlationId: uuidv4(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: !isNaN(headerData[HEADER_PAYMENT_REQUEST_NO]) ? parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]) : undefined,
  contractNumber: headerData[HEADER_CONTRACT_NO],
  paymentType: !isNaN(headerData[CS_HEADER_PAYMENT_TYPE]) ? parseInt(headerData[CS_HEADER_PAYMENT_TYPE]) : undefined,
  frn: headerData[SFI_CS_HEADER_FRN],
  currency: headerData[SFI_CS_HEADER_CURRENCY],
  value: !isNaN(headerData[SFI_CS_HEADER_VALUE]) ? parseFloat(headerData[SFI_CS_HEADER_VALUE]) : undefined,
  deliveryBody: headerData[SFI_CS_HEADER_DELIVERY_BODY],
  invoiceLines: []
})

module.exports = transformHeader
