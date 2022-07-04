const buildPaymentRequests = require('./build-payment-requests')
const { convertToPence, getTotalValueInPence } = require('../../currency-convert')

const paymentRequestSchema = require('./schemas/payment-request')
const { isInvoiceLineValid } = require('./build-invoice-lines')

const filterPaymentRequest = (paymentRequests, sourceSystem) => {
  const paymentRequestCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  buildPaymentRequests(paymentRequests, sourceSystem)
    .map(x => handlePaymentRequest(x, paymentRequestCollection))
  return paymentRequestCollection
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest, { abortEarly: false })
  if (validationResult.error) {
    console.error(`Payment request is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

const validateLineTotals = (paymentRequest) => {
  return convertToPence(paymentRequest.value) === getTotalValueInPence(paymentRequest.invoiceLines, 'value')
}

const validatePaymentRequest = (paymentRequest) => {
  const paymentRequestValid = isPaymentRequestValid(paymentRequest)
  const invoiceLinesValid = paymentRequest.invoiceLines.every(x => isInvoiceLineValid(x))
  const lineTotalsValid = validateLineTotals(paymentRequest)

  return paymentRequestValid && invoiceLinesValid && lineTotalsValid
}

const handlePaymentRequest = (paymentRequest, paymentRequestCollection) => {
  validatePaymentRequest(paymentRequest)
    ? paymentRequestCollection.successfulPaymentRequests.push(paymentRequest)
    : paymentRequestCollection.unsuccessfulPaymentRequests.push(paymentRequest)
}

module.exports = filterPaymentRequest
