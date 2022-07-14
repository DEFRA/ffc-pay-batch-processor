const buildPaymentRequests = require('./build-payment-requests')
const { convertToPence, getTotalValueInPence } = require('../../currency-convert')

const paymentRequestSchema = require('./schemas/payment-request')
const { isInvoiceLineValid } = require('./build-invoice-lines')

const filterPaymentRequest = (paymentRequests, sourceSystem) => {
  const paymentRequestsCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  buildPaymentRequests(paymentRequests, sourceSystem)
    .map(x => handlePaymentRequest(x, paymentRequestsCollection))
  return paymentRequestsCollection
}

const handlePaymentRequest = (paymentRequest, paymentRequestsCollection) => {
  validatePaymentRequest(paymentRequest)
    ? paymentRequestsCollection.successfulPaymentRequests.push(paymentRequest)
    : paymentRequestsCollection.unsuccessfulPaymentRequests.push(paymentRequest)
}

const validatePaymentRequest = (paymentRequest) => {
  const paymentRequestValid = isPaymentRequestValid(paymentRequest)
  const lineTotalsValid = validateLineTotals(paymentRequest)

  const invoiceLinesValid = paymentRequest.invoiceLines.map(x => isInvoiceLineValid(x))
  const invoiceLinesError = invoiceLinesValid.map(x => x.result === false ? x.errorMessage : '').filter(x => x !== '').join(' ')
  const invoiceLinesErrorObject = { result: invoiceLinesError === '', errorMessage: invoiceLinesError }

  const validationArray = [paymentRequestValid, lineTotalsValid, invoiceLinesErrorObject]
  validationArray.filter(x => x.result === false).forEach(x => addErrorMessage(paymentRequest, x.errorMessage))

  return paymentRequestValid.result && lineTotalsValid.result && invoiceLinesErrorObject.result
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest, { abortEarly: false })
  if (validationResult.error) {
    const errorMessage = `Payment request is invalid, ${validationResult.error.message} `
    console.error(errorMessage)
    return { result: false, errorMessage }
  }
  return { result: true }
}

const validateLineTotals = (paymentRequest) => {
  const validationResult = convertToPence(paymentRequest.value) === getTotalValueInPence(paymentRequest.invoiceLines, 'value')
  if (!validationResult) {
    const errorMessage = 'Payment request is invalid, invalid line total '
    console.error(errorMessage)
    return { result: false, errorMessage }
  }
  return { result: true }
}

const addErrorMessage = (paymentRequest, errorMessage) => {
  paymentRequest.errorMessage ? paymentRequest.errorMessage += errorMessage : paymentRequest.errorMessage = errorMessage
}

module.exports = filterPaymentRequest
