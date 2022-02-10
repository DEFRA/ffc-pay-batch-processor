const buildPaymentRequests = (paymentRequests) => {
  return paymentRequests.map(paymentRequest => (
    {
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
    })
  )
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

module.exports = buildPaymentRequests
