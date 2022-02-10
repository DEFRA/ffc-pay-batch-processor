const getInvoiceTotalInPence = require('./invoice-totals')
const { convertToPence } = require('../currency-convert')

const validateLineTotals = (invoiceHeaders) => {
  return invoiceHeaders
    .every(a => convertToPence(a.totalValue) === getInvoiceTotalInPence(a.lines, 'value'))
}

const validate = (invoiceBatch, invoiceHeaders) => {
  if (invoiceBatch.length === 0) return false

  const numberOfInvoicesValid = invoiceBatch[0].numberOfInvoices === invoiceHeaders.length
  const invoiceTotalsValid = convertToPence(invoiceBatch[0].batchValue) === getInvoiceTotalInPence(invoiceHeaders, 'totalValue')
  const invoiceLinesTotalsValid = validateLineTotals(invoiceHeaders)
  const checkNumberNumberOfBatches = invoiceBatch.length === 1
  return numberOfInvoicesValid && invoiceTotalsValid && invoiceLinesTotalsValid && checkNumberNumberOfBatches
}

module.exports = validate
