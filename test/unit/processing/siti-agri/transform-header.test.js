const { GBP } = require('../../../../app/constants/currency')
const transformHeader = require('../../../../app/processing/siti-agri/transform-header')
const { M12 } = require('../../../../app/constants/schedule')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr } = require('../../../../app/schemes')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

describe('Transform header', () => {
  const correlationId = require('../../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  test('transforms SFI header', async () => {
    const filename = 'SITISFI0001_AP_20230315083522081.dat'
    const headerData = ['H', 'SFI0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfi.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'SFI0000001',
      paymentRequestNumber: 1,
      contractNumber: 'S000001',
      frn: '1000000001',
      currency: GBP,
      value: 100,
      deliveryBody: 'RP00',
      schedule: M12,
      invoiceLines: []
    })
  })

  test('for SFI return undefined if paymentRequestNumber is NaN', async () => {
    const filename = 'SITISFI0001_AP_20230315083522081.dat'
    const headerData = ['H', 'SFI0000001', 'abc', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfi.schemeId, filename)
    expect(result.paymentRequestNumber).toBe(undefined)
  })

  test('for SFI return undefined if value is NaN', async () => {
    const filename = 'SITISFI0001_AP_20230315083522081.dat'
    const headerData = ['H', 'SFI0000001', '01', 'S000001', '1', '1000000001', 'GBP', 'abc', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfi.schemeId, filename)
    expect(result.value).toBe(undefined)
  })

  test('transforms SFI Pilot header', async () => {
    const filename = 'SITIELM0001_AP_20230315083940939.dat'
    const headerData = ['H', 'SFIP0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfiPilot.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'SFIP0000001',
      paymentRequestNumber: 1,
      contractNumber: 'S000001',
      frn: '1000000001',
      currency: GBP,
      value: 100,
      deliveryBody: 'RP00',
      schedule: M12,
      invoiceLines: []
    })
  })

  test('transforms Lump Sums header', async () => {
    const filename = 'SITILSES0001_AP_20230315084137333.dat'
    const headerData = ['H', 'LSES0000001', '001', 'L000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, lumpSums.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'LSES0000001',
      paymentRequestNumber: 1,
      contractNumber: 'L000001',
      frn: '1000000001',
      currency: GBP,
      value: 100,
      deliveryBody: 'RP00',
      invoiceLines: []
    })
  })

  test('transforms BPS header', async () => {
    const filename = 'SITI_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'SITI0000001', '001', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, bps.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'SITI0000001',
      paymentRequestNumber: 1,
      contractNumber: 'C0000001',
      frn: '1000000001',
      value: 100,
      deliveryBody: 'RP00',
      currency: GBP,
      invoiceLines: []
    })
  })

  test('for BPS return undefined if paymentRequestNumber is NaN', async () => {
    const filename = 'SITI_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'SITI0000001', 'abc', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, bps.schemeId, filename)
    expect(result.paymentRequestNumber).toBe(undefined)
  })

  test('for BPS return undefined if value is NaN', async () => {
    const filename = 'SITI_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'SITI0000001', '001', 'C0000001', '1000000001', '1', 'abc', 'RP00', 'GBP']
    const result = transformHeader(headerData, bps.schemeId, filename)
    expect(result.value).toBe(undefined)
  })

  test('transforms CS header', async () => {
    const filename = 'SITICS0001_AP_20230315084313836.dat'
    const headerData = ['H', 'CS000000001', '001', 'A0000001', '1', '1000000001', 'GBP', '100', 'NE00', 'GBP']
    const result = transformHeader(headerData, cs.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'CS000000001',
      paymentRequestNumber: 1,
      contractNumber: 'A0000001',
      paymentType: 1,
      frn: '1000000001',
      currency: GBP,
      value: 100,
      deliveryBody: 'NE00',
      invoiceLines: []
    })
  })

  test('for CS return undefined if paymentRequestNumber is NaN', async () => {
    const filename = 'SITICS0001_AP_20230315084313836.dat'
    const headerData = ['H', 'CS000000001', 'abc', 'A0000001', '1', '1000000001', 'GBP', '100', 'NE00', 'GBP']
    const result = transformHeader(headerData, cs.schemeId, filename)
    expect(result.paymentRequestNumber).toBe(undefined)
  })

  test('for CS return undefined if value is NaN', async () => {
    const filename = 'SITICS0001_AP_20230315084313836.dat'
    const headerData = ['H', 'CS000000001', '001', 'A0000001', '1', '1000000001', 'GBP', 'abc', 'NE00', 'GBP']
    const result = transformHeader(headerData, cs.schemeId, filename)
    expect(result.value).toBe(undefined)
  })

  test('for CS return Payment Type as an int', async () => {
    const filename = 'SITICS0001_AP_20230315084313836.dat'
    const headerData = ['H', 'CS000000001', '001', 'A0000001', '1', '1000000001', 'GBP', '100', 'NE00', 'GBP']
    const result = transformHeader(headerData, cs.schemeId, filename)
    expect(result.paymentType).toBe(1)
  })

  test('for CS return Payment Type as undefined if NaN', async () => {
    const filename = 'SITICS0001_AP_20230315084313836.dat'
    const headerData = ['H', 'CS000000001', '001', 'A0000001', 'payment-type', '1000000001', 'GBP', '100', 'NE00', 'GBP']
    const result = transformHeader(headerData, cs.schemeId, filename)
    expect(result.paymentType).toBe(undefined)
  })

  test('transforms FDMR header', async () => {
    const filename = 'FDMR_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'FDMR0000001', '001', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, fdmr.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      batch: filename,
      invoiceNumber: 'FDMR0000001',
      paymentRequestNumber: 1,
      contractNumber: 'C0000001',
      frn: '1000000001',
      value: 100,
      deliveryBody: 'RP00',
      currency: GBP,
      invoiceLines: []
    })
  })

  test('for FDMR return undefined if paymentRequestNumber is NaN', async () => {
    const filename = 'FDMR_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'FDMR0000001', 'abc', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, fdmr.schemeId, filename)
    expect(result.paymentRequestNumber).toBe(undefined)
  })

  test('for FDMR return undefined if value is NaN', async () => {
    const filename = 'FDMR_0001_AP_20230315081841316.dat'
    const headerData = ['H', 'FDMR0000001', '001', 'C0000001', '1000000001', '1', 'abc', 'RP00', 'GBP']
    const result = transformHeader(headerData, fdmr.schemeId, filename)
    expect(result.value).toBe(undefined)
  })

  test('returns undefined values if line empty', async () => {
    const headerData = []
    const result = transformHeader(headerData, lumpSums.schemeId)
    Object.values(result).forEach(value => expect(value === undefined || value.length === 0 || value === uuidv4()).toBeTruthy())
  })

  test('throws error if no scheme', async () => {
    const headerData = []
    expect(() => transformHeader(headerData)).toThrowError('Unknown scheme: undefined')
  })

  test('throws error if unknown scheme', async () => {
    const headerData = []
    expect(() => transformHeader(headerData, 99)).toThrowError('Unknown scheme: 99')
  })
})
