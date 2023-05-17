const calculateGrossAfterPenalties = (invoiceLinesByScheme) => {
  const penaltyInvoiceLines = invoiceLinesByScheme.filter(invoiceLine => invoiceLine.description.match(/^P0/gm))
  const totalPenalties = penaltyInvoiceLines.reduce((total, invoiceLine) => total + invoiceLine.value, 0)
  const grossPayment = invoiceLinesByScheme.find(invoiceLine => invoiceLine.description.match(/^G00/gm))?.value
  return Math.abs(grossPayment) - Math.abs(totalPenalties)
}

module.exports = { calculateGrossAfterPenalties }
