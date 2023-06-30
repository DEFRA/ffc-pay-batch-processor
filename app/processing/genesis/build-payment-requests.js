const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    sourceSystem,
    batch: paymentRequest.batch,
    invoiceNumber: paymentRequest.invoiceNumber,
    vendor: paymentRequest.vendor,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    contractNumber: paymentRequest.contractNumber,
    value: paymentRequest.value,
    correlationId: paymentRequest.correlationId,
    invoiceLines: paymentRequest.invoiceLines ?? []
  }))
}

module.exports = buildPaymentRequests
