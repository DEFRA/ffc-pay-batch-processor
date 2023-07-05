const transformInvoiceLine = require('../../../../app/processing/imps/transform-invoice-line')

describe('transform IMPS invoice lines', () => {
  test('transforms invoice line', async () => {
    const lineData = ['L', 'PAY', 'J00001', 'FVR/J00001001', '200.00', '', '', '1.000', 'NUMBER', '', '1.000000', '', '543/11', '', '4022', '2022', '', '01-JAN-22', '', '', '', 'N', 'Partial Payments 2022', '', '', '', '', '', '', '', '', '', 'N', '']
    const result = transformInvoiceLine(lineData)
    expect(result).toEqual({
      invoiceNumber: 'FVR/J00001001',
      value: 200,
      productCode: '4022',
      marketingYear: 2022,
      description: 'Partial Payments 2022',
      exchangeRate: '1.000000',
      eventDate: '01-JAN-22'
    })
  })
})
