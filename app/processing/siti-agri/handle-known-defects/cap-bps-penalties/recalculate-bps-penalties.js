const recalculateBPSPenalties = (paymentRequest) => {
  const schemeCodes = [...new Set(paymentRequest.invoiceLines.map(invoiceLine => invoiceLine.schemeCode))]

  schemeCodes.forEach((schemeCode) => {
    const invoiceLinesByScheme = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.schemeCode === schemeCode)

    if (calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) < 0) {
      const p04Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P04/gm))[0]
      const p02Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P02/gm))[0]

      if (p04Penalty) {
        if (p04Penalty.value - calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) > 0) {
          p04Penalty.value = 0
        } else {
          p04Penalty.value -= calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme)
        }
      }

      if (calculateGrossAfterPenalties(paymentRequest, invoiceLinesByScheme) < 0) {
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
  return Math.abs(grossPayment) - Math.abs(totalPenalties)
}

module.exports = {
  recalculateBPSPenalties
}
