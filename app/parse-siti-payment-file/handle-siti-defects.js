const GROSS_LINE_DESCRIPTION = 'G00 - Gross value of claim'
const PARTICIPATION_PAYMENT_SCHEME_CODE = '80009'

const handleSitiDefects = (paymentRequest) => {
  return removeDefunctParticipationPayment(paymentRequest)
}

const removeDefunctParticipationPayment = (paymentRequest) => {
  // Defect in Siti Agri where full agreement should be recovered, but Siti Agri cannot set the participation gross value to 0
  // If participation payment is only gross value, then we need to set it to 0 so Delta will calculate correctly
  const nonParticipationPaymentInvoiceLines = paymentRequest.invoiceLines.filter(x => x.description === GROSS_LINE_DESCRIPTION && x.value !== 0 && x.schemeCode !== PARTICIPATION_PAYMENT_SCHEME_CODE)
  if (!nonParticipationPaymentInvoiceLines.length) {
    const participationPaymentInvoiceLine = paymentRequest.invoiceLines.find(x => x.description === GROSS_LINE_DESCRIPTION && x.value !== 0 && x.schemeCode === PARTICIPATION_PAYMENT_SCHEME_CODE)
    if (participationPaymentInvoiceLine) {
      paymentRequest.value = paymentRequest.value - participationPaymentInvoiceLine.value
      participationPaymentInvoiceLine.value = 0
    }
  }
  return paymentRequest
}

module.exports = handleSitiDefects
