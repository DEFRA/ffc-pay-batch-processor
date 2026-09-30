jest.mock('node:crypto')
const { randomUUID } = require('node:crypto')

const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const { GBP } = require('../../../../app/constants/currency')
const { M12, Y1, Q4 } = require('../../../../app/constants/schedule')
const transformHeader = require('../../../../app/processing/siti-agri/transform-header')

const {
  LUMP_SUMS,
  BPS,
  CS,
  SFI,
  SFI_PILOT,
  SFI_EXPANDED,
  COHT_REVENUE,
  DELINKED
} = getSchemeIds()

const {
  SFI: SFI_SOURCE_SYSTEM,
  SFI_PILOT: SFI_PILOT_SOURCE_SYSTEM,
  SFI_EXPANDED: SFI_EXPANDED_SOURCE_SYSTEM,
  COHT_REVENUE: COHT_REVENUE_SOURCE_SYSTEM,
  DELINKED: DELINKED_SOURCE_SYSTEM
} = getSourceSystems()

describe('Transform header', () => {
  const correlationId = require('../../../mocks/correlation-id')

  beforeEach(() => {
    randomUUID.mockReturnValue(correlationId)
  })

  const testCases = [
    {
      filename: 'SITISFI0001_AP.dat',
      headerData: ['H', 'SFI0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', SFI_SOURCE_SYSTEM, 'M12'],
      schemeId: SFI,
      expectedSchedule: M12,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITIELM0001_AP.dat',
      headerData: ['H', 'SFIP0000001', '01', 'S000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', SFI_PILOT_SOURCE_SYSTEM, 'M12'],
      schemeId: SFI_PILOT,
      expectedSchedule: M12,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITILSES0001_AP.dat',
      headerData: ['H', 'LSES0000001', '001', 'L000001', '1000000001', '1', '100', 'RP00', 'GBP'],
      schemeId: LUMP_SUMS,
      frnIndex: 4,
      valueIndex: 6,
      prnIndex: 2,
      deliveryBodyIndex: 7
    },
    {
      filename: 'SITI_0001_AP.dat',
      headerData: ['H', 'SITI0000001', '001', 'C0000001', '1000000001', '1', '100', 'RP00', 'GBP'],
      schemeId: BPS,
      frnIndex: 4,
      valueIndex: 6,
      prnIndex: 2,
      deliveryBodyIndex: 7
    },
    {
      filename: 'SITICS0001_AP.dat',
      headerData: ['H', 'CS000000001', '001', 'A0000001', '1', '1000000001', 'GBP', '100', 'NE00', 'GBP'],
      schemeId: CS,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'ESFIO0001_AP.dat',
      headerData: ['H', 'ESFIO0000001', '01', 'E000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', SFI_EXPANDED_SOURCE_SYSTEM, 'Q4'],
      schemeId: SFI_EXPANDED,
      expectedSchedule: Q4,
      expectedSchemeId: SFI_EXPANDED,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'ESFIO0001_AP.dat',
      headerData: ['H', 'ESFIO0000001', '01', 'E000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', COHT_REVENUE_SOURCE_SYSTEM, 'Q4'],
      schemeId: SFI_EXPANDED,
      expectedSchedule: Q4,
      expectedSchemeId: COHT_REVENUE,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    },
    {
      filename: 'SITIDP0001_AP.dat',
      headerData: ['H', 'DP0000001', '01', 'Z000001', '1', '1000000001', 'GBP', '100', 'RP00', 'GBP', DELINKED_SOURCE_SYSTEM, 'Y1'],
      schemeId: DELINKED,
      expectedSchedule: Y1,
      frnIndex: 5,
      valueIndex: 7,
      prnIndex: 2,
      deliveryBodyIndex: 8
    }
  ]

  test.each(testCases)(
    'transforms scheme $schemeId header',
    ({ headerData, schemeId, filename, expectedSchedule, expectedSchemeId, frnIndex, valueIndex, prnIndex, deliveryBodyIndex }) => {
      const result = transformHeader(headerData, schemeId, filename)

      expect(result).toEqual(expect.objectContaining({
        correlationId,
        schemeId: expectedSchemeId || schemeId,
        batch: filename,
        invoiceNumber: headerData[1],
        paymentRequestNumber: Number.parseInt(headerData[prnIndex], 10),
        contractNumber: headerData[3],
        frn: headerData[frnIndex],
        currency: GBP,
        value: Number.parseInt(headerData[valueIndex], 10),
        invoiceLines: []
      }))

      if (expectedSchedule) {
        expect(result.schedule).toBe(expectedSchedule)
      }

      expect(result.deliveryBody).toBe(headerData[deliveryBodyIndex])
    }
  )

  test.each(testCases)(
    'handles invalid numbers for scheme $schemeId',
    ({ headerData, schemeId, filename, prnIndex, valueIndex }) => {
      const invalidPaymentRequestNumber = [...headerData]
      invalidPaymentRequestNumber[prnIndex] = 'abc'

      const invalidValue = [...headerData]
      invalidValue[valueIndex] = 'abc'

      expect(
        transformHeader(invalidPaymentRequestNumber, schemeId, filename).paymentRequestNumber
      ).toBeUndefined()

      expect(
        transformHeader(invalidValue, schemeId, filename).value
      ).toBeUndefined()
    }
  )

  test('returns expected shape for an empty line', () => {
    const result = transformHeader([], LUMP_SUMS)

    expect(result).toEqual(expect.objectContaining({
      schemeId: LUMP_SUMS,
      correlationId,
      paymentRequestNumber: undefined,
      value: undefined,
      batch: undefined,
      invoiceNumber: undefined,
      contractNumber: undefined,
      frn: undefined,
      currency: undefined,
      deliveryBody: undefined,
      invoiceLines: []
    }))
  })

  test('throws an error if no scheme is supplied', () => {
    expect(() => transformHeader([])).toThrow('Unknown scheme: undefined')
  })

  test('throws an error if an unknown scheme is supplied', () => {
    expect(() => transformHeader([], 99)).toThrow('Unknown scheme: 99')
  })
})
