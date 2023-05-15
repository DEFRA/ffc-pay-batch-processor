const mappedInvoiceLines = [{
  schemeCode: 'SITIELM',
  accountCode: 'ABC123',
  fundCode: 'ABC12',
  agreementNumber: 'SIP123456789012',
  description: 'G00 - Gross value of claim',
  value: 100,
  deliveryBody: 'RP00'
}]

const invoiceLines = [{
  ...mappedInvoiceLines[0],
  marketingYear: 2022,
  dueDate: '2022-11-02'
}]

module.exports = { mappedInvoiceLines, invoiceLines }
