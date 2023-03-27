const transformInvoiceLine = require('../../../../app/processing/siti-agri/transform-invoice-line')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr } = require('../../../../app/schemes')

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

  test('transforms SFI Pilot invoice line', async () => {
    const lineData = ['L', 'SFIP0000001', '100', '2022', '80001', 'DRD10', 'SIP00000000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273']
    const result = transformInvoiceLine(lineData, sfiPilot.schemeId)
    expect(result).toEqual({
      invoiceNumber: 'SFIP0000001',
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

  test('transforms Lump Sums invoice line', async () => {
    const lineData = ['L', 'LSES0000001', '100', '2022', '10501', 'EGF00', 'RP00', '1', 'G00 - Gross value of claim', '2022-12-01']
    const result = transformInvoiceLine(lineData, lumpSums.schemeId)
    expect(result).toEqual({
      invoiceNumber: 'LSES0000001',
      value: 100,
      marketingYear: 2022,
      schemeCode: '10501',
      fundCode: 'EGF00',
      deliveryBody: 'RP00',
      description: 'G00 - Gross value of claim',
      dueDate: '2022-12-01'
    })
  })

  test('transforms BPS invoice line', async () => {
    const lineData = ['L', 'SITI0000001', '100', '2023', '10501', 'EGF00', 'RP00', '1', 'G00 - Gross value of claim', '2023-12-01'
    ]
    const result = transformInvoiceLine(lineData, bps.schemeId)
    expect(result).toEqual({
      invoiceNumber: 'SITI0000001',
      value: 100,
      marketingYear: 2023,
      schemeCode: '10501',
      fundCode: 'EGF00',
      deliveryBody: 'RP00',
      description: 'G00 - Gross value of claim',
      dueDate: '2023-12-01'
    })
  })

  test('transforms CS invoice line', async () => {
    const lineData = ['L', 'CS000000001', '100', '2023', '5704A', 'ERD14', 'A01000000001/MT', 'NE00', 'Y', '1', 'G00 - Gross value of claim', '2023-12-01', 'SOS273']
    const result = transformInvoiceLine(lineData, cs.schemeId)
    expect(result).toEqual({
      invoiceNumber: 'CS000000001',
      value: 100,
      marketingYear: 2023,
      schemeCode: '5704A',
      fundCode: 'ERD14',
      agreementNumber: 'A01000000001/MT',
      deliveryBody: 'NE00',
      convergence: true,
      description: 'G00 - Gross value of claim',
      dueDate: '2023-12-01',
      accountCode: 'SOS273'
    })
  })

  test('transforms FDMR invoice line', async () => {
    const lineData = ['L', 'FDMR0000001', '100', '2023', '10573', 'EGF00', 'RP00', '1', 'G01 - Gross value of claim', '2023-12-01']
    const result = transformInvoiceLine(lineData, fdmr.schemeId)
    expect(result).toEqual({
      invoiceNumber: 'FDMR0000001',
      value: 100,
      marketingYear: 2023,
      schemeCode: '10573',
      fundCode: 'EGF00',
      deliveryBody: 'RP00',
      description: 'G01 - Gross value of claim',
      dueDate: '2023-12-01'
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
