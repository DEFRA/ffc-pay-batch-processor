const { getSchemeIds, getSourceSystems, isSitiAgri } = require('ffc-pay-schemes')
const { randomUUID } = require('node:crypto')
const { parseInteger, parseFloatValue } = require('../numeric-parse-helpers')

const { LUMP_SUMS, BPS, CS, SFI_EXPANDED, COHT_REVENUE, COHT_CAPITAL } = getSchemeIds()
const { COHT_REVENUE: COHT_REVENUE_SOURCE_SYSTEM } = getSourceSystems()

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
  const schemeIdNum = Number(schemeId)

  if (Number.isNaN(schemeIdNum) || !isSitiAgri(schemeIdNum)) {
    throw new TypeError(`Unknown scheme: ${schemeId}`)
  }

  switch (schemeIdNum) {
    case Number(LUMP_SUMS):
      return transformLumpSumsHeader(headerData, schemeIdNum, filename)
    case Number(BPS):
      return transformBPSHeader(headerData, schemeIdNum, filename)
    case Number(CS):
      return transformCSHeader(headerData, schemeIdNum, filename)
    default:
      return transformSFIOrDPHeader(headerData, schemeIdNum, filename)
  }
}

const getCombinedOfferSchemeId = (headerData, schemeId) => {
  // SFI Expanded files can contain both SFI Expanded and COHT Revenue.
  // It will always be one or the other per payment request.
  const sourceSystem = headerData[SFI_HEADER_SOURCE_SYSTEM]

  if (sourceSystem === COHT_REVENUE_SOURCE_SYSTEM) {
    console.log('SFI Expanded Offer payment request has been identified as COHT Revenue, scheme ID adjusted accordingly')
    return COHT_REVENUE
  }

  return schemeId
}

const transformSFIOrDPHeader = (headerData, schemeId, filename) => {
  const headerItems = {
    correlationId: randomUUID(),
    schemeId: schemeId === SFI_EXPANDED
      ? getCombinedOfferSchemeId(headerData, schemeId)
      : schemeId,
    batch: filename,
    invoiceNumber: headerData[HEADER_INVOICE_NO],
    paymentRequestNumber: parseInteger(headerData[HEADER_PAYMENT_REQUEST_NO]),
    contractNumber: headerData[HEADER_CONTRACT_NO],
    frn: headerData[SFI_CS_HEADER_FRN],
    currency: headerData[SFI_CS_HEADER_CURRENCY],
    value: parseFloatValue(headerData[SFI_CS_HEADER_VALUE]),
    deliveryBody: headerData[SFI_CS_HEADER_DELIVERY_BODY],
    schedule: headerData[SFI_HEADER_SCHEDULE],
    invoiceLines: []
  }

  if (schemeId === COHT_CAPITAL) {
    delete headerItems.schedule
  }

  return headerItems
}

const transformLumpSumsHeader = (headerData, schemeId, filename) => ({
  correlationId: randomUUID(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: parseInteger(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  frn: headerData[LUMP_BPS_HEADER_FRN],
  currency: headerData[LUMP_BPS_HEADER_CURRENCY],
  value: parseFloatValue(headerData[LUMP_BPS_HEADER_VALUE]),
  deliveryBody: headerData[LUMP_BPS_HEADER_DELIVERY_BODY],
  invoiceLines: []
})

const transformBPSHeader = (headerData, schemeId, filename) => ({
  correlationId: randomUUID(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: parseInteger(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  frn: headerData[LUMP_BPS_HEADER_FRN],
  value: parseFloatValue(headerData[LUMP_BPS_HEADER_VALUE]),
  deliveryBody: headerData[LUMP_BPS_HEADER_DELIVERY_BODY],
  currency: headerData[LUMP_BPS_HEADER_CURRENCY],
  invoiceLines: []
})

const transformCSHeader = (headerData, schemeId, filename) => ({
  correlationId: randomUUID(),
  schemeId,
  batch: filename,
  invoiceNumber: headerData[HEADER_INVOICE_NO],
  paymentRequestNumber: parseInteger(headerData[HEADER_PAYMENT_REQUEST_NO]),
  contractNumber: headerData[HEADER_CONTRACT_NO],
  paymentType: parseInteger(headerData[CS_HEADER_PAYMENT_TYPE]),
  frn: headerData[SFI_CS_HEADER_FRN],
  currency: headerData[SFI_CS_HEADER_CURRENCY],
  value: parseFloatValue(headerData[SFI_CS_HEADER_VALUE]),
  deliveryBody: headerData[SFI_CS_HEADER_DELIVERY_BODY],
  invoiceLines: []
})

module.exports = transformHeader
