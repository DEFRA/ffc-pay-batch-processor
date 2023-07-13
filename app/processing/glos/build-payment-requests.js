const { v4: uuidv4 } = require('uuid')
const { buildInvoiceLines } = require('./build-invoice-lines')

const buildPaymentRequests = (paymentRequests) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    ...paymentRequest,
    correlationId: uuidv4(),
    invoiceLines: buildInvoiceLines(paymentRequest.invoiceLines)
  }))
}

module.exports = buildPaymentRequests
