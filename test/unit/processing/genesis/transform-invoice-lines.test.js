const transformInvoiceLine = require('../../../../app/processing/genesis/transform-invoice-line')

describe('transform genesis invoice lines', () => {
  test('transforms invoice line', async () => {
    const lineData = ['D', '1096514', '32', '40121', '01372', '0197', '221', '', '10767.74', 'Payment for ESS P1 to P2 Transfer Other objective in North West', '', '', '', '', '', '', '', '', '']
    const result = transformInvoiceLine(lineData)
    expect(result).toEqual({
      invoiceNumber: 'SFI0000001',
      value: 100,
      marketingYear: 2022,
      schemeCode: '80001',
      fundCode: 'DRD10',
      agreementNumber: 'SIP00000000001',
      deliveryBody: 'RP00',
      description: 'G00 - Gross value of claim',
      dueDate: '2022-12-01',
      accountCode: 'SOS273'
    })
  })
})
