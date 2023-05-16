const recalculateBPSPenalties = (paymentRequest) => {
  const schemeCodes = [...new Set(paymentRequest.invoiceLines.map(invoiceLine => invoiceLine.schemeCode))]

  schemeCodes.forEach((schemeCode) => {
    const invoiceLinesByScheme = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.schemeCode === schemeCode)
    let grossAfterPenalties = calculateGrossAfterPenalties(invoiceLinesByScheme)

    if (grossAfterPenalties < 0) {
      const p04Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P04/gm))[0]
      const p02Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P02/gm))[0]

      if (p04Penalty) {
        p04Penalty.value = p04Penalty.value - grossAfterPenalties > 0 ? 0 : p04Penalty.value -= grossAfterPenalties
        grossAfterPenalties = calculateGrossAfterPenalties(invoiceLinesByScheme)
      }

      if (grossAfterPenalties < 0) {
        p02Penalty.value -= grossAfterPenalties
      }
    }
  })
  return paymentRequest
}

const calculateGrossAfterPenalties = (invoiceLinesByScheme) => {
  const penaltyInvoiceLines = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P0/gm))
  const totalPenalties = penaltyInvoiceLines.reduce((total, invoiceLine) => total + invoiceLine.value, 0)
  const grossPayment = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^G00/gm))[0].value
  return Math.abs(grossPayment) - Math.abs(totalPenalties)
}

module.exports = {
  recalculateBPSPenalties
}
