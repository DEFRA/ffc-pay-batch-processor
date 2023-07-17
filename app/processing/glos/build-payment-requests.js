const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    correlationId: paymentRequest.correlationId,
    sourceSystem,
    batch: paymentRequest.batch,
    invoiceNumber: paymentRequest.invoiceNumber,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    frn: paymentRequest.frn,
    sbi: paymentRequest.sbi,
    claimDate: paymentRequest.claimDate,
    invoiceLines: paymentRequest.invoiceLines ?? []
  }))
}

module.exports = buildPaymentRequests
