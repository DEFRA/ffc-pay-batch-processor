const { isNetLine } = require('./is-net-line')
const invoiceLineSchema = require('./schemas/invoice-line')

const buildInvoiceLines = (paymentRequest) => {
  const { invoiceLines } = paymentRequest
  try {
    return invoiceLines
      .filter(x => !isNetLine(x))
      .map(invoiceLine => ({
        schemeCode: invoiceLine.schemeCode.toString(),
        accountCode: invoiceLine.accountCode,
        fundCode: invoiceLine.fundCode,
        agreementNumber: invoiceLine.agreementNumber,
        description: invoiceLine.description,
        value: invoiceLine.value,
        convergence: invoiceLine.convergence,
        deliveryBody: invoiceLine.deliveryBody,
        marketingYear: invoiceLine.marketingYear
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
