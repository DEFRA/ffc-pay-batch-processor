const checkInvoiceTotal = require('./invoice-totals')

const validate = (invoiceBatch, invoiceHeaders) => {
  const numberOfInvoicesValid = invoiceBatch[0].numberOfInvoices === invoiceHeaders.length
  const invoiceTotalsValid = invoiceBatch[0].batchValue === checkInvoiceTotal(invoiceHeaders, 'totalValue')
  const invoiceLinesTotalsValid = invoiceHeaders.filter(a => a.lineTotalsValid).length === 0 ?? false

  return numberOfInvoicesValid && invoiceTotalsValid && invoiceLinesTotalsValid
}

module.exports = validate
