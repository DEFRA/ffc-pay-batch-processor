const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, sfi23, delinked, combinedOffer, cohtCapital } = require('../../constants/schemes')
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
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
    case sfi23.schemeId:
    case delinked.schemeId:
    case combinedOffer.schemeId:
      return transformSFIOrDPInvoiceLine(lineData, schemeId)
    case lumpSums.schemeId:
    case bps.schemeId:
    case fdmr.schemeId:
      return transformSitiInvoiceLine(lineData)
    case cs.schemeId:
      return transformCSInvoiceLine(lineData)
    case cohtCapital.schemeId:
      return transformSFIOrDPInvoiceLine(lineData, schemeId)
    default:
      throw new Error(`Unknown scheme: ${schemeId}`)
  }
}

const transformSFIOrDPInvoiceLine = (lineData, schemeId) => {
  const isCOHTC = String(schemeId) === String(cohtCapital.schemeId)
  const lineItems = {
    invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
    value: !isNaN(lineData[LINE_DATA_VALUE]) ? parseFloat(lineData[LINE_DATA_VALUE]) : undefined,
    marketingYear: !isNaN(lineData[LINE_DATA_MARKETING_YEAR]) ? parseInt(lineData[LINE_DATA_MARKETING_YEAR]) : undefined,
    schemeCode: lineData[LINE_DATA_SCHEME_CODE],
    fundCode: lineData[LINE_DATA_FUND_CODE],
    agreementNumber: lineData[LINE_DATA_AGREEMENT_NUMBER],
    deliveryBody: lineData[LINE_DATA_DELIVERY_BODY],
    description: lineData[LINE_DATA_DESCRIPTION],
    dueDate: lineData[LINE_DATA_DUE_DATE] ? lineData[LINE_DATA_DUE_DATE] : undefined,
    accountCode: isCOHTC ? lineData[LINE_DATA_ACCOUNT_CODE_COHTC] : lineData[LINE_DATA_ACCOUNT_CODE_SFI]
  }
  if (isCOHTC) {
    delete lineItems.dueDate
  }

  return lineItems
}

const transformSitiInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
  value: !isNaN(lineData[LINE_DATA_VALUE]) ? parseFloat(lineData[LINE_DATA_VALUE]) : undefined,
  marketingYear: !isNaN(lineData[LINE_DATA_MARKETING_YEAR]) ? parseInt(lineData[LINE_DATA_MARKETING_YEAR]) : undefined,
  schemeCode: lineData[LINE_DATA_SCHEME_CODE],
  fundCode: lineData[LINE_DATA_FUND_CODE],
  deliveryBody: lineData[LINE_DATA_DELIVERY_BODY_SITI],
  description: lineData[LINE_DATA_DESCRIPTION_SITI],
  dueDate: lineData[LINE_DATA_DUE_DATE_SITI]
})

const transformCSInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[LINE_DATA_INVOICE_NUMBER],
  value: !isNaN(lineData[LINE_DATA_VALUE]) ? parseFloat(lineData[LINE_DATA_VALUE]) : undefined,
  marketingYear: !isNaN(lineData[LINE_DATA_MARKETING_YEAR]) ? parseInt(lineData[LINE_DATA_MARKETING_YEAR]) : undefined,
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
