const transformInvoiceLine = require('../../../../app/processing/genesis/transform-invoice-line')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr } = require('../../../../app/constants/schemes')

describe('Transform invoice lines', () => {
  test('transforms SFI invoice line', async () => {
    const lineData = ['L', 'SFI0000001', '100', '2022', '80001', 'DRD10', 'SIP00000000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273']
    const result = transformInvoiceLine(lineData, sfi.schemeId)
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

  test('returns undefined values if line empty', async () => {
    const lineData = []
    const result = transformInvoiceLine(lineData, lumpSums.schemeId)
    Object.values(result).forEach(value => expect(value).toBeUndefined())
  })

  test('throws error if no scheme', async () => {
    const lineData = []
    expect(() => transformInvoiceLine(lineData)).toThrowError('Unknown scheme: undefined')
  })

  test('throws error if unknown scheme', async () => {
    const lineData = []
    expect(() => transformInvoiceLine(lineData, 99)).toThrowError('Unknown scheme: 99')
  })
})
