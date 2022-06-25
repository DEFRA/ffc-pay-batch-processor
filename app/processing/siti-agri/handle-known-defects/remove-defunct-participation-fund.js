const { convertToPence } = require('../../../currency-convert')
const { sfiPilot } = require('../../../schemes')
const GROSS_LINE_DESCRIPTION = 'G00 - Gross value of claim'
const PARTICIPATION_PAYMENT_SCHEME_CODE = '80009'

const removeDefunctParticipationPayment = (paymentRequest) => {
  if (paymentRequest.sourceSystem !== sfiPilot.sourceSystem) {
    return paymentRequest
  }
  // Defect in Siti Agri where full agreement should be recovered, but Siti Agri cannot set the participation gross value to 0
  // If participation payment is only non-zero value grouped by scheme code, then we need to set it to 0 so Delta will calculate correctly
  const schemeCodeGroups = groupBySchemeCode(paymentRequest.invoiceLines)
  const nonParticipationPaymentGroups = schemeCodeGroups.filter(x => x.value !== 0 && x.schemeCode !== PARTICIPATION_PAYMENT_SCHEME_CODE)

  if (!nonParticipationPaymentGroups.length) {
    const participationPaymentInvoiceLine = paymentRequest.invoiceLines.find(x => x.description === GROSS_LINE_DESCRIPTION && x.value !== 0 && x.schemeCode === PARTICIPATION_PAYMENT_SCHEME_CODE)
    if (participationPaymentInvoiceLine) {
      paymentRequest.value = 0
      participationPaymentInvoiceLine.value = 0
    }
  }
  return paymentRequest
}

const groupBySchemeCode = (invoiceLines) => {
  return [...invoiceLines.reduce((x, y) => {
    const key = y.schemeCode

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || Object.assign({}, { schemeCode: y.schemeCode, value: 0 })
    item.value += convertToPence(y.value)

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = removeDefunctParticipationPayment
