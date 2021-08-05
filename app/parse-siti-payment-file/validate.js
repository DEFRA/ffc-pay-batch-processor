const getInvoiceTotal = require('./invoice-totals')

const validateLineTotals = (invoiceHeaders) => {
  return invoiceHeaders
    .every(a => a.totalValue === getInvoiceTotal(a.lines, 'value'))
}

const validate = (invoiceBatch, invoiceHeaders) => {
  if (invoiceBatch.length === 0) return false

  const numberOfInvoicesValid = invoiceBatch[0].numberOfInvoices === invoiceHeaders.length
  const invoiceTotalsValid = invoiceBatch[0].batchValue === getInvoiceTotal(invoiceHeaders, 'totalValue')
  const invoiceLinesTotalsValid = validateLineTotals(invoiceHeaders)
  const checkNumberNumberOfBatches = invoiceBatch.length === 1
  return numberOfInvoicesValid && invoiceTotalsValid && invoiceLinesTotalsValid & checkNumberNumberOfBatches
}

module.exports = validate
