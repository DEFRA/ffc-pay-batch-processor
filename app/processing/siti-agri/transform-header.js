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

const parseValue = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseInt = (value) => {
  const parsed = Number.parseInt(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const transformHeader = (headerData, schemeId, filename) => {
  const schemeIdNum = Number(schemeId)

  if (Number.isNaN(schemeIdNum)) {
    throw new TypeError(`Unknown scheme: ${schemeId}`)
  }

  const sfiGroup = new Set([
    Number(sfi.schemeId),
    Number(sfiPilot.schemeId),
    Number(sfi23.schemeId),
    Number(delinked.schemeId),
    Number(combinedOffer.schemeId),
    Number(cohtCapital.schemeId)
  ])

  if (sfiGroup.has(schemeIdNum)) {
    return transformSFIOrDPHeader(headerData, schemeIdNum, filename)
  }

  switch (schemeIdNum) {
    case Number(lumpSums.schemeId):
      return transformLumpSumsHeader(headerData, schemeIdNum, filename)
    case Number(bps.schemeId):
    case Number(fdmr.schemeId):
      return transformBPSHeader(headerData, schemeIdNum, filename)
    case Number(cs.schemeId):
      return transformCSHeader(headerData, schemeIdNum, filename)
    default:
      throw new Error(`Unknown scheme: ${schemeId}`)
  }
}

const getSchemeId = (headerData, schemeId) => {
  const sourceSystem = headerData[SFI_HEADER_SOURCE_SYSTEM]
  if (sourceSystem === combinedOfferSchemes.cohtRevenue.sourceSystem) {
    return combinedOfferSchemes.cohtRevenue.schemeId
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
    paymentRequestNumber: parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]),
    contractNumber: headerData[HEADER_CONTRACT_NO],
    frn: headerData[SFI_CS_HEADER_FRN],
    currency: headerData[SFI_CS_HEADER_CURRENCY],
    value: parseValue(headerData[SFI_CS_HEADER_VALUE]),
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
  paymentRequestNumber: parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  frn: headerData[LUMP_BPS_HEADER_FRN],
  currency: headerData[LUMP_BPS_HEADER_CURRENCY],
  value: parseValue(headerData[LUMP_BPS_HEADER_VALUE]),
  deliveryBody: headerData[LUMP_BPS_HEADER_DELIVERY_BODY],
  invoiceLines: []
})

const transformBPSHeader = (headerData, schemeId, filename) => ({
  correlationId: uuidv4(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  frn: headerData[LUMP_BPS_HEADER_FRN],
  value: parseValue(headerData[LUMP_BPS_HEADER_VALUE]),
  deliveryBody: headerData[LUMP_BPS_HEADER_DELIVERY_BODY],
  currency: headerData[LUMP_BPS_HEADER_CURRENCY],
  invoiceLines: []
})

const transformCSHeader = (headerData, schemeId, filename) => ({
  correlationId: uuidv4(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: parseInt(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  paymentType: parseInt(headerData[CS_HEADER_PAYMENT_TYPE]),
  frn: headerData[SFI_CS_HEADER_FRN],
  currency: headerData[SFI_CS_HEADER_CURRENCY],
  value: parseValue(headerData[SFI_CS_HEADER_VALUE]),
  deliveryBody: headerData[SFI_CS_HEADER_DELIVERY_BODY],
  invoiceLines: []
})

module.exports = transformHeader
