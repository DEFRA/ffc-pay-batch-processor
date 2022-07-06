const paymentRequestSchema = require('./schemas/payment-request')
const handleKnownDefects = require('./handle-known-defects')
const { buildInvoiceLines, isInvoiceLineValid } = require('./build-invoice-lines')
const { v4: uuidv4 } = require('uuid')

const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  return paymentRequests.map(paymentRequest => ({
    sourceSystem,
    deliveryBody: paymentRequest.deliveryBody,
    invoiceNumber: paymentRequest.invoiceNumber,
    frn: paymentRequest.frn,
    marketingYear: paymentRequest.invoiceLines[0].marketingYear,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    agreementNumber: paymentRequest.invoiceLines[0].agreementNumber,
    contractNumber: paymentRequest.contractNumber,
    currency: paymentRequest.currency,
    schedule: paymentRequest.schedule,
    dueDate: paymentRequest.invoiceLines[0].dueDate,
    value: paymentRequest.value,
    correlationId: uuidv4(),
    invoiceLines: buildInvoiceLines(paymentRequest.invoiceLines)
  })).map(handleKnownDefects).filter(isPaymentRequestValid)
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest, { abortEarly: false })
  if (validationResult.error) {
    console.error(`Payment request is invalid. ${validationResult.error.message}`)
    return false
  }
  return paymentRequest.invoiceLines.every(isInvoiceLineValid)
}

module.exports = buildPaymentRequests
