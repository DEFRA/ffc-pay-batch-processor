const { GBP } = require('../../../../app/constants/currency')
const transformHeader = require('../../../../app/processing/siti-agri/transform-header')
const { M12 } = require('../../../../app/constants/schedule')
const { sfi, sfiPilot, lumpSums, bps, cs } = require('../../../../app/schemes')

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
      frn: '1000000001',
      currency: GBP,
      value: 100,
      deliveryBody: 'NE00',
      invoiceLines: []
    })
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
