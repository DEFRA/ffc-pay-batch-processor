const { sfi } = require('../../../constants/schemes')
const { MOORLAND_SCHEME_CODE } = require('../../../constants/scheme-codes')
const { GROSS_LINE_DESCRIPTION } = require('../../../constants/line-descriptions')
const { convertToPence } = require('../../../currency-convert')

const removeMoorlandPayment = (paymentRequest) => {
  if (paymentRequest.sourceSystem !== sfi.sourceSystem) {
    return paymentRequest
  }

  // If moorland payment is only non-zero value grouped by scheme code, then we need to set it to 0 so Delta will calculate correctly
  const schemeCodeGroups = groupBySchemeCode(paymentRequest.invoiceLines)
  const nonMoorlandPaymentGroups = schemeCodeGroups.filter(x => x.value !== 0 && x.schemeCode !== MOORLAND_SCHEME_CODE)

  if (!nonMoorlandPaymentGroups.length) {
    const moorlandPaymentInvoiceLine = paymentRequest.invoiceLines.find(x => x.description === GROSS_LINE_DESCRIPTION && x.value !== 0 && x.schemeCode === MOORLAND_SCHEME_CODE)
    if (moorlandPaymentInvoiceLine) {
      paymentRequest.value = 0
      moorlandPaymentInvoiceLine.value = 0
    }
  }
  return paymentRequest
}

const groupBySchemeCode = (invoiceLines) => {
  return [...invoiceLines.reduce((x, y) => {
    const key = y.schemeCode

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || {
      ...{ schemeCode: y.schemeCode, value: 0 }
    }
    item.value += convertToPence(y.value)
    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = { removeMoorlandPayment }
