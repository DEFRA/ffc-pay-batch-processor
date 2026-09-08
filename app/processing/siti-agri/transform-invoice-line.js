const { getSchemeIds, isSitiAgri } = require('ffc-pay-schemes')
const { parseInteger, parseFloatValue } = require('../numeric-parse-helpers')

const { LUMP_SUMS, BPS, CS, COHT_CAPITAL } = getSchemeIds()

const LINE_DATA_INVOICE_NUMBER = 1
const LINE_DATA_VALUE = 2
const LINE_DATA_MARKETING_YEAR = 3
const LINE_DATA_SCHEME_CODE = 4
const LINE_DATA_FUND_CODE = 5
const LINE_DATA_AGREEMENT_NUMBER = 6
const LINE_DATA_DELIVERY_BODY = 7
const LINE_DATA_DELIVERY_BODY_SITI = 6
const LINE_DATA_DESCRIPTION_SITI = 8
const LINE_DATA_DESCRIPTION = 10
const LINE_DATA_DUE_DATE = 11
const LINE_DATA_DUE_DATE_SITI = 9
const LINE_DATA_ACCOUNT_CODE = 12
const LINE_DATA_ACCOUNT_CODE_SFI = 13
const LINE_DATA_ACCOUNT_CODE_COHTC = 14
const LINE_DATA_CONVERGENCE = 8

const transformInvoiceLine = (lineData, schemeId) => {
  const schemeIdNumber = Number(schemeId)

  if (Number.isNaN(schemeIdNumber) || !isSitiAgri(schemeIdNumber)) {
    throw new TypeError(`Unknown scheme: ${schemeId}`)
  }

  switch (schemeIdNumber) {
    case Number(LUMP_SUMS):
    case Number(BPS):
      return transformSitiInvoiceLine(lineData)
    case Number(CS):
      return transformCSInvoiceLine(lineData)
    default:
      return transformSFIOrDPInvoiceLine(lineData, schemeIdNumber)
  }
}

const transformSFIOrDPInvoiceLine = (lineData, schemeId) => {
  const isCOHTC = schemeId === Number(COHT_CAPITAL)

  const lineItems = {
    invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
    value: parseFloatValue(lineData[LINE_DATA_VALUE]),
    marketingYear: parseInteger(lineData[LINE_DATA_MARKETING_YEAR]),
    schemeCode: lineData[LINE_DATA_SCHEME_CODE],
    fundCode: lineData[LINE_DATA_FUND_CODE],
    agreementNumber: lineData[LINE_DATA_AGREEMENT_NUMBER],
    deliveryBody: lineData[LINE_DATA_DELIVERY_BODY],
    description: lineData[LINE_DATA_DESCRIPTION],
    dueDate: lineData[LINE_DATA_DUE_DATE] || undefined,
    accountCode: isCOHTC
      ? lineData[LINE_DATA_ACCOUNT_CODE_COHTC]
      : lineData[LINE_DATA_ACCOUNT_CODE_SFI]
  }

  if (isCOHTC) {
    delete lineItems.dueDate
  }

  return lineItems
}

const transformSitiInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
  value: parseFloatValue(lineData[LINE_DATA_VALUE]),
  marketingYear: parseInteger(lineData[LINE_DATA_MARKETING_YEAR]),
  schemeCode: lineData[LINE_DATA_SCHEME_CODE],
  fundCode: lineData[LINE_DATA_FUND_CODE],
  deliveryBody: lineData[LINE_DATA_DELIVERY_BODY_SITI],
  description: lineData[LINE_DATA_DESCRIPTION_SITI],
  dueDate: lineData[LINE_DATA_DUE_DATE_SITI]
})

const transformCSInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
  value: parseFloatValue(lineData[LINE_DATA_VALUE]),
  marketingYear: parseInteger(lineData[LINE_DATA_MARKETING_YEAR]),
  schemeCode: lineData[LINE_DATA_SCHEME_CODE],
  fundCode: lineData[LINE_DATA_FUND_CODE],
  agreementNumber: lineData[LINE_DATA_AGREEMENT_NUMBER],
  deliveryBody: lineData[LINE_DATA_DELIVERY_BODY],
  convergence: lineData[LINE_DATA_CONVERGENCE] === 'Y',
  description: lineData[LINE_DATA_DESCRIPTION],
  dueDate: lineData[LINE_DATA_DUE_DATE],
  accountCode: lineData[LINE_DATA_ACCOUNT_CODE]
})

module.exports = transformInvoiceLine
