const { GBP } = require('../../../../app/currency')
const transformHeader = require('../../../../app/processing/siti-agri/transform-header')
const { M12 } = require('../../../../app/schedules')
const { sfi, sfiPilot, lumpSums } = require('../../../../app/schemes')

describe('Transform header', () => {
  test('transforms SFI header', async () => {
    const headerData = ['H', 'SFI0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfi.schemeId)
    expect(result).toMatchObject({
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
    const headerData = ['H', 'SFIP0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12']
    const result = transformHeader(headerData, sfiPilot.schemeId)
    expect(result).toMatchObject({
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
    const headerData = ['H', 'LSES0000001', '001', 'L000001', '1000000001', '1', '100', 'RP00', 'GBP']
    const result = transformHeader(headerData, lumpSums.schemeId)
    expect(result).toMatchObject({
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

  test('returns undefined values if line empty', async () => {
    const headerData = []
    const result = transformHeader(headerData, lumpSums.schemeId)
    Object.values(result).forEach(value => expect(value === undefined || value.length === 0).toBeTruthy())
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
