const { GBP } = require('../../../../app/constants/currency')
const transformHeader = require('../../../../app/processing/siti-agri/transform-header')
const { M12, Y1, Q4 } = require('../../../../app/constants/schedule')
const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, sfi23, delinked, combinedOffer } = require('../../../../app/constants/schemes')
const { sfiExpanded, cohtRevenue } = require('../../../../app/constants/combined-offer-schemes')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

describe('Transform header', () => {
  const correlationId = require('../../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  const testCases = [
    {
      filename: 'SITISFI0001_AP.dat',
      headerData: ['H', 'SFI0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12'],
      scheme: sfi,
      expectedSchedule: M12,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITIELM0001_AP.dat',
      headerData: ['H', 'SFIP0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFI', 'M12'],
      scheme: sfiPilot,
      expectedSchedule: M12,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITILSES0001_AP.dat',
      headerData: ['H', 'LSES0000001', '001', 'L000001', '1000000001', '1', '100', 'RP00', 'GBP'],
      scheme: lumpSums,
      frnIndex: 4,
      valueIndex: 6,
      prnIndex: 2,
      deliveryBodyIndex: 7
    },
    {
      filename: 'SITI_0001_AP.dat',
      headerData: ['H', 'SITI0000001', '001', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP'],
      scheme: bps,
      frnIndex: 4,
      valueIndex: 6,
      prnIndex: 2,
      deliveryBodyIndex: 7
    },
    {
      filename: 'SITICS0001_AP.dat',
      headerData: ['H', 'CS000000001', '001', 'A0000001', '1', '1000000001', 'GBP', '100', 'NE00', 'GBP'],
      scheme: cs,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'FDMR_0001_AP.dat',
      headerData: ['H', 'FDMR0000001', '001', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP'],
      scheme: fdmr,
      frnIndex: 4,
      valueIndex: 6,
      prnIndex: 2,
      deliveryBodyIndex: 7
    },
    {
      filename: 'SITISFIA0001_AP.dat',
      headerData: ['H', 'SFIA0000001', '01', 'Z000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'SFIA', 'M12'],
      scheme: sfi23,
      expectedSchedule: M12,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITIDP0001_AP.dat',
      headerData: ['H', 'DP0000001', '01', 'Z000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'DP', 'Y1'],
      scheme: delinked,
      expectedSchedule: Y1,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'ESFIO0001_AP.dat',
      headerData: ['H', 'ESFIO0000001', '01', 'E000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'ESFIO', 'Q4'],
      scheme: combinedOffer,
      expectedSchedule: Q4,
      expectedSchemeId: sfiExpanded.schemeId,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'ESFIO0001_AP.dat',
      headerData: ['H', 'ESFIO0000001', '01', 'E000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', 'COHTR', 'Q4'],
      scheme: combinedOffer,
      expectedSchedule: Q4,
      expectedSchemeId: cohtRevenue.schemeId,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    }
  ]

  test.each(testCases)('transforms $scheme.schemeId header', ({ headerData, scheme, filename, expectedSchedule, expectedSchemeId, frnIndex, valueIndex, prnIndex, deliveryBodyIndex }) => {
    const result = transformHeader(headerData, scheme.schemeId, filename)
    expect(result.correlationId).toEqual(correlationId)
    expect(result.schemeId).toEqual(expectedSchemeId || scheme.schemeId)
    expect(result.batch).toEqual(filename)
    expect(result.invoiceNumber).toEqual(headerData[1])
    expect(result.paymentRequestNumber).toEqual(parseInt(headerData[prnIndex], 10))
    expect(result.contractNumber).toEqual(headerData[3])
    expect(result.frn).toEqual(headerData[frnIndex])
    expect(result.currency).toEqual(GBP)
    expect(result.value).toEqual(parseInt(headerData[valueIndex], 10))
    if (expectedSchedule) {
      expect(result.schedule).toEqual(expectedSchedule)
    }

    if (typeof deliveryBodyIndex !== 'undefined') {
      expect(result.deliveryBody).toEqual(headerData[deliveryBodyIndex])
    }

    expect(Array.isArray(result.invoiceLines)).toBeTruthy()
  })

  const invalidNumberCases = [
    { fieldIndex: 'prnIndex', fieldName: 'paymentRequestNumber' },
    { fieldIndex: 'valueIndex', fieldName: 'value' }
  ]

  test.each(testCases)('handles invalid numbers in $scheme.schemeId header', ({ headerData, scheme, filename, prnIndex, valueIndex }) => {
    invalidNumberCases.forEach(({ fieldIndex, fieldName }) => {
      const invalidHeader = [...headerData]
      invalidHeader[fieldIndex === 'prnIndex' ? prnIndex : valueIndex] = 'abc'
      const result = transformHeader(invalidHeader, scheme.schemeId, filename)
      expect(result[fieldName]).toBeUndefined()
    })
  })

  test('returns expected shape for empty line', () => {
    const result = transformHeader([], lumpSums.schemeId)
    expect(result.schemeId).toEqual(lumpSums.schemeId)
    expect(result.correlationId).toEqual(correlationId)
    expect(result.paymentRequestNumber).toBeUndefined()
    expect(result.value).toBeUndefined()
    expect(result.batch).toBeUndefined()
    expect(result.invoiceNumber).toBeUndefined()
    expect(result.contractNumber).toBeUndefined()
    expect(result.frn).toBeUndefined()
    expect(result.currency).toBeUndefined()
    expect(result.deliveryBody).toBeUndefined()
    expect(Array.isArray(result.invoiceLines)).toBeTruthy()
    expect(result.invoiceLines).toHaveLength(0)
  })

  test('throws error if no scheme', () => {
    expect(() => transformHeader([])).toThrowError('Unknown scheme: undefined')
  })

  test('throws error if unknown scheme', () => {
    expect(() => transformHeader([], 99)).toThrowError('Unknown scheme: 99')
  })
})
