const { v4: uuidv4 } = require('uuid')
const { buildInvoiceLines } = require('./build-invoice-lines')
const handleKnownDefects = require('./handle-known-defects')

const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    sourceSystem,
    schemeId: paymentRequest.schemeId,
    batch: paymentRequest.batch,
    deliveryBody: paymentRequest.deliveryBody,
    invoiceNumber: paymentRequest.invoiceNumber,
    frn: paymentRequest.frn,
    marketingYear: paymentRequest.invoiceLines?.[0]?.marketingYear,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    agreementNumber: paymentRequest.invoiceLines?.[0]?.agreementNumber,
    contractNumber: paymentRequest.contractNumber,
    paymentType: paymentRequest.paymentType,
    currency: paymentRequest.currency,
    schedule: paymentRequest.schedule,
    dueDate: paymentRequest.invoiceLines?.[0]?.dueDate,
    value: paymentRequest.value,
    correlationId: uuidv4(),
    invoiceLines: buildInvoiceLines(paymentRequest.invoiceLines)
  })).map(x => handleKnownDefects(x))
}

module.exports = buildPaymentRequests
