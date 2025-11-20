const transformInvoiceLine = require('../../../../app/processing/siti-agri/transform-invoice-line')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, sfi23, delinked, combinedOffer, cohtCapital } = require('../../../../app/constants/schemes')

describe('Transform invoice lines', () => {
  const testCases = [
    {
      scheme: sfi,
      lineData: ['L', 'SFI0000001', '100', '2022', '80001', 'DRD10', 'SIP00000000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273'],
      expected: { invoiceNumber: 'SFI0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DRD10', agreementNumber: 'SIP00000000001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01', accountCode: 'SOS273' }
    },
    {
      scheme: sfiPilot,
      lineData: ['L', 'SFIP0000001', '100', '2022', '80001', 'DRD10', 'SIP00000000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273'],
      expected: { invoiceNumber: 'SFIP0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DRD10', agreementNumber: 'SIP00000000001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01', accountCode: 'SOS273' }
    },
    {
      scheme: lumpSums,
      lineData: ['L', 'LSES0000001', '100', '2022', '10501', 'EGF00', 'RP00', '1', 'G00 - Gross value of claim', '2022-12-01'],
      expected: { invoiceNumber: 'LSES0000001', value: 100, marketingYear: 2022, schemeCode: '10501', fundCode: 'EGF00', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01' }
    },
    {
      scheme: bps,
      lineData: ['L', 'SITI0000001', '100', '2023', '10501', 'EGF00', 'RP00', '1', 'G00 - Gross value of claim', '2023-12-01'],
      expected: { invoiceNumber: 'SITI0000001', value: 100, marketingYear: 2023, schemeCode: '10501', fundCode: 'EGF00', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2023-12-01' }
    },
    {
      scheme: cs,
      lineData: ['L', 'CS000000001', '100', '2023', '5704A', 'ERD14', 'A01000000001/MT', 'NE00', 'Y', '1', 'G00 - Gross value of claim', '2023-12-01', 'SOS273'],
      expected: { invoiceNumber: 'CS000000001', value: 100, marketingYear: 2023, schemeCode: '5704A', fundCode: 'ERD14', agreementNumber: 'A01000000001/MT', deliveryBody: 'NE00', convergence: true, description: 'G00 - Gross value of claim', dueDate: '2023-12-01', accountCode: 'SOS273' }
    },
    {
      scheme: fdmr,
      lineData: ['L', 'FDMR0000001', '100', '2023', '10573', 'EGF00', 'RP00', '1', 'G01 - Gross value of claim', '2023-12-01'],
      expected: { invoiceNumber: 'FDMR0000001', value: 100, marketingYear: 2023, schemeCode: '10573', fundCode: 'EGF00', deliveryBody: 'RP00', description: 'G01 - Gross value of claim', dueDate: '2023-12-01' }
    },
    {
      scheme: sfi23,
      lineData: ['L', 'SFIA0000001', '100', '2022', '80001', 'DRD10', 'Z000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273'],
      expected: { invoiceNumber: 'SFIA0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DRD10', agreementNumber: 'Z000001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01', accountCode: 'SOS273' }
    },
    {
      scheme: delinked,
      lineData: ['L', 'DP0000001', '100', '2022', '80001', 'DOM10', 'Z000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS210'],
      expected: { invoiceNumber: 'DP0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DOM10', agreementNumber: 'Z000001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01', accountCode: 'SOS210' }
    },
    {
      scheme: combinedOffer,
      lineData: ['L', 'ESFIO0000001', '100', '2022', '80001', 'DOM10', 'E000001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', '2022-12-01', 'SOS273'],
      expected: { invoiceNumber: 'ESFIO0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DOM10', agreementNumber: 'E000001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', dueDate: '2022-12-01', accountCode: 'SOS273' }
    },
    {
      scheme: cohtCapital,
      lineData: ['L', 'COHT0000001', '100', '2022', '80001', 'DRD10', 'AG0001', 'RP00', 'N', '1', 'G00 - Gross value of claim', '2022-12-01', 'unused12', 'SFIacct', 'COHTacct'],
      expected: { invoiceNumber: 'COHT0000001', value: 100, marketingYear: 2022, schemeCode: '80001', fundCode: 'DRD10', agreementNumber: 'AG0001', deliveryBody: 'RP00', description: 'G00 - Gross value of claim', accountCode: 'COHTacct' } // no dueDate
    }
  ]

  test.each(testCases)('transforms $scheme.schemeId invoice line', ({ lineData, scheme, expected }) => {
    const result = transformInvoiceLine(lineData, scheme.schemeId)
    expect(result).toEqual(expected)
    if (scheme === cohtCapital) {
      expect(result.dueDate).toBeUndefined() // special COHT rule
    }
  })

  test('returns undefined values for empty lines', () => {
    const schemesToTest = [lumpSums, cohtCapital]
    schemesToTest.forEach(s => {
      const result = transformInvoiceLine([], s.schemeId)
      Object.values(result).forEach(v => expect(v).toBeUndefined())
      if (s === cohtCapital) {
        expect(result.dueDate).toBeUndefined()
      }
    })
  })

  test('throws error if no scheme', () => {
    expect(() => transformInvoiceLine([])).toThrowError('Unknown scheme: undefined')
  })

  test('throws error if unknown scheme', () => {
    expect(() => transformInvoiceLine([], 99)).toThrowError('Unknown scheme: 99')
  })
})
