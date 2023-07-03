const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    ...paymentRequest,
    sourceSystem,
    marketingYear: paymentRequest.invoiceLines?.[0]?.marketingYear,
    exchangeRate: paymentRequest.invoiceLines?.[0]?.exchangeRate,
    eventDate: paymentRequest.invoiceLines?.filter(x => x.eventDate !== undefined)?.[0]?.eventDate,
    invoiceLines: paymentRequest.invoiceLines ?? []
  }))
}

module.exports = buildPaymentRequests
