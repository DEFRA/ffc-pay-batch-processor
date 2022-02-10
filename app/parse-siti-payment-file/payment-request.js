const paymentRequestSchema = require('./schemas/payment-request')
const invoiceLineSchema = require('./schemas/invoice-line')

const buildPaymentRequests = (paymentRequests) => {
  return paymentRequests.map(paymentRequest => ({
    sourceSystem: paymentRequest.sourceSystem,
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
    invoiceLines: buildInvoiceLines(paymentRequest.invoiceLines)
  })).filter(isPaymentRequestValid)
}

const buildInvoiceLines = (invoiceLines) => {
  return invoiceLines.map(invoiceLine => ({
    schemeCode: invoiceLine.schemeCode.toString(),
    accountCode: invoiceLine.accountCode,
    fundCode: invoiceLine.fundCode,
    description: invoiceLine.description,
    value: invoiceLine.value
  })
  )
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest)
  if (validationResult.error) {
    console.error(`Payment request is invalid. ${validationResult.error.message}`)
    return false
  }
  return paymentRequest.invoiceLines.every(isInvoiceLineValid)
}

const isInvoiceLineValid = (invoiceLine) => {
  const validationResult = invoiceLineSchema.validate(invoiceLine)
  if (validationResult.error) {
    console.error(`Invoice line is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

module.exports = buildPaymentRequests
