const buildPaymentRequests = require('./build-payment-requests')

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

  const invoiceLinesValid = paymentRequest.invoiceLines.map(x => isInvoiceLineValid(x))
  const invoiceLinesError = invoiceLinesValid.map(x => x.result === false ? x.errorMessage : '').filter(x => x !== '').join(' ')
  const invoiceLinesErrorObject = { result: invoiceLinesError === '', errorMessage: invoiceLinesError }

  const validationArray = [paymentRequestValid, invoiceLinesErrorObject]
  validationArray.filter(x => x.result === false).forEach(x => addErrorMessage(paymentRequest, x.errorMessage))

  return paymentRequestValid.result && invoiceLinesErrorObject.result
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest, { abortEarly: false })
  if (validationResult.error) {
    const errorMessage = `Payment request content is invalid, ${validationResult.error.message}. `
    console.error(errorMessage)
    return { result: false, errorMessage }
  }
  return { result: true }
}

const addErrorMessage = (paymentRequest, errorMessage) => {
  if (paymentRequest.errorMessage) {
    paymentRequest.errorMessage += errorMessage
  } else {
    paymentRequest.errorMessage = `Payment request for FRN: ${paymentRequest.frn} - ${paymentRequest.invoiceNumber} is invalid, ${errorMessage}`
  }
}

module.exports = filterPaymentRequest
