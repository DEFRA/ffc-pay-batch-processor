const invoiceToPaymentRequest = (invoiceHeaders) => {
  return invoiceHeaders.map(invoiceHeader => (
    {
      sourceSystem: invoiceHeader.creatorId,
      deliveryBody: invoiceHeader.deliveryBodyCode,
      invoiceHeader: invoiceHeader.invoiceNumber,
      frn: invoiceHeader.frn,
      sbi: invoiceHeader.frn,
      marketingYear: invoiceHeader.lines[0].marketingYear,
      paymentRequestNumber: invoiceHeader.paymentType,
      agreementNumber: invoiceHeader.lines[0].agreementNumber,
      contractNumber: invoiceHeader.claimId,
      currency: invoiceHeader.currency,
      schedule: invoiceHeader.monthlyPaymentSchedule,
      dueDate: invoiceHeader.lines[0].dueDate,
      value: invoiceHeader.totalValue,
      invoiceLines: invoiceLineToPaymentRequest(invoiceHeader.lines)
    })
  )
}

const invoiceLineToPaymentRequest = (invoiceLines) => {
  return invoiceLines.map(invoiceline => ({
    standardCode: invoiceline.schemeCode,
    accountCode: invoiceline.msdaxAccountCode,
    fundCode: invoiceline.fund,
    description: invoiceline.lineDescription,
    value: invoiceline.value
  })
  )
}

module.exports = invoiceToPaymentRequest
