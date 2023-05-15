const recalculateBPSPenalties = (paymentRequest) => {
  // get all unique schemes
  const schemeCodes = [...new Set(paymentRequest.invoiceLines.map(invoiceLine => invoiceLine.schemeCode))] // [10501, 10502 ...]

  // loop over the schemeCodes array
  schemeCodes.forEach((schemeCode) => {
    const invoiceLinesByScheme = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.schemeCode === schemeCode) // array of invoice lines with same scheme code

    if (calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) < 0) {
      const p04Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P04/gm))[0]
      const p02Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P02/gm))[0]
      // reduce P04 if present
      if (p04Penalty) {
        if (p04Penalty.value - calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) > 0) {
          p04Penalty.value = 0
        } else {
          p04Penalty.value -= calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme)
        }
      }
      // check if still < 0
      if (calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) < 0) {
        // reduce P02 until grossPayment is 0
        p02Penalty.value -= calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme)
      }
    }
  })
  return paymentRequest
}

const calculateGrossAfterPenalties = (paymentRequest, invoiceLinesByScheme) => {
  const penaltyInvoiceLines = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P0/gm))
  const totalPenalties = penaltyInvoiceLines.reduce((total, invoiceLine) => total + invoiceLine.value, 0)
  const grossPayment = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^G00/gm))[0].value
  console.log(`total penalties = ${totalPenalties}, gross total = ${grossPayment}, total = ${Math.abs(grossPayment) - Math.abs(totalPenalties)}`)
  return Math.abs(grossPayment) - Math.abs(totalPenalties)
}

module.exports = {
  recalculateBPSPenalties
}
