const { calculateGrossAfterPenalties } = require('./calculate-gross-after-penalties')

const recalculateBPSPenalties = (paymentRequest) => {
  const schemeCodes = [...new Set(paymentRequest.invoiceLines.map(invoiceLine => invoiceLine.schemeCode))]

  schemeCodes.forEach((schemeCode) => {
    const invoiceLinesByScheme = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.schemeCode === schemeCode)
    let grossAfterPenalties = calculateGrossAfterPenalties(invoiceLinesByScheme)

    if (grossAfterPenalties < 0) {
      const p04Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P04/gm))[0]
      const p02Penalty = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P02/gm))[0]

      if (p04Penalty) {
        p04Penalty.value = p04Penalty.value - grossAfterPenalties > 0 ? 0 : p04Penalty.value - grossAfterPenalties
        grossAfterPenalties = calculateGrossAfterPenalties(invoiceLinesByScheme)
      }

      if (grossAfterPenalties < 0) {
        p02Penalty.value -= grossAfterPenalties
      }
    }
  })
  return paymentRequest
}

module.exports = {
  recalculateBPSPenalties
}
