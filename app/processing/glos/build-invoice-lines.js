const invoiceLineSchema = require('./schemas/invoice-line')

const buildInvoiceLines = (invoiceLines) => {
  try {
    return invoiceLines
      .map(invoiceLine => ({
        standardCode: invoiceLine.standardCode.toString(),
        description: invoiceLine.description,
        value: invoiceLine.value
      })
      )
  } catch {
    return []
  }
}

const isInvoiceLineValid = (invoiceLine) => {
  const validationResult = invoiceLineSchema.validate(invoiceLine, { abortEarly: false })
  if (validationResult.error) {
    const errorMessage = `Invoice line is invalid. ${validationResult.error.message}`
    console.error(errorMessage)
    return { result: false, errorMessage }
  }
  return { result: true }
}

module.exports = {
  buildInvoiceLines,
  isInvoiceLineValid
}
