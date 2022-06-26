const invoiceLineSchema = require('./schemas/invoice-line')

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

const isInvoiceLineValid = (invoiceLine) => {
  const validationResult = invoiceLineSchema.validate(invoiceLine, { abortEarly: false })
  if (validationResult.error) {
    console.error(`Invoice line is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

module.exports = {
  buildInvoiceLines,
  isInvoiceLineValid
}
