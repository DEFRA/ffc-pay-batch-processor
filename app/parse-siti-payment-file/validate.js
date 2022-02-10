const valueInPence = require('./value')
const { convertToPence } = require('../currency-convert')

const validateLineTotals = (paymentRequests) => {
  return paymentRequests
    .every(a => convertToPence(a.value) === valueInPence(a.invoiceLines, 'value'))
}

const validate = (batchHeader, paymentRequests) => {
  if (batchHeader.length === 0) return false

  const numberOfPaymentRequestsValid = batchHeader[0].numberOfPaymentRequests === paymentRequests.length
  const batchValueTotalsValid = convertToPence(batchHeader[0].batchValue) === valueInPence(paymentRequests, 'value')
  const invoiceLinesValuesValid = validateLineTotals(paymentRequests)
  const numberOfBatchHeadersValid = batchHeader.length === 1
  return numberOfPaymentRequestsValid && batchValueTotalsValid && invoiceLinesValuesValid && numberOfBatchHeadersValid
}

module.exports = validate
