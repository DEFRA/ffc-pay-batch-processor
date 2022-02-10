const valueInPence = require('./value')
const { convertToPence } = require('../currency-convert')
const schema = require('./schemas/batch-header')

const validateLineTotals = (paymentRequests) => {
  return paymentRequests
    .every(a => convertToPence(a.value) === valueInPence(a.invoiceLines, 'value'))
}

const validate = (batchHeader, paymentRequests) => {
  if (batchHeader.length === 0) return false

  const validSchema = isValidSchema(batchHeader[0])
  const numberOfPaymentRequestsValid = batchHeader[0].numberOfPaymentRequests === paymentRequests.length
  const batchValueTotalsValid = convertToPence(batchHeader[0].batchValue) === valueInPence(paymentRequests, 'value')
  const invoiceLinesValuesValid = validateLineTotals(paymentRequests)
  const numberOfBatchHeadersValid = batchHeader.length === 1
  return validSchema && numberOfPaymentRequestsValid && batchValueTotalsValid && invoiceLinesValuesValid && numberOfBatchHeadersValid
}

const isValidSchema = (batchHeader) => {
  const validationResult = schema.validate(batchHeader)
  if (validationResult.error) {
    console.error(`Batch header is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

module.exports = validate
