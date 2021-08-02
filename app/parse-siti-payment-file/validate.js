const getInvoiceTotal = require('./invoice-totals')

const validateLineTotals = (invoiceHeaders) => {
  return invoiceHeaders
    .map(a => a.totalValue === getInvoiceTotal(a.lines, 'value'))
    .every(b => b === true)
}

const validate = (invoiceBatch, invoiceHeaders) => {
  const numberOfInvoicesValid = invoiceBatch[0].numberOfInvoices === invoiceHeaders.length
  const invoiceTotalsValid = invoiceBatch[0].batchValue === getInvoiceTotal(invoiceHeaders, 'totalValue')
  const invoiceLinesTotalsValid = validateLineTotals(invoiceHeaders)
  const checkNumberNumberOfBatches = invoiceBatch.length === 1 ?? false
  return numberOfInvoicesValid && invoiceTotalsValid && invoiceLinesTotalsValid & checkNumberNumberOfBatches
}

module.exports = validate
