const { getSourceSystems } = require('ffc-pay-schemes')
const { correctCSMarketingYear } = require('../../../../../app/processing/siti-agri/handle-known-defects/correct-cs-marketing-year')

const { CS: CS_SOURCE_SYSTEM, SFI: SFI_SOURCE_SYSTEM } = getSourceSystems()

let paymentRequest

describe('correct CS marketing year', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../../mocks/payment-request').paymentRequest)
    paymentRequest.sourceSystem = CS_SOURCE_SYSTEM
  })

  test.each([
    ['scheme is not CS', SFI_SOURCE_SYSTEM, 20],
    ['marketing year < 16', CS_SOURCE_SYSTEM, 15],
    ['marketing year already 4 digits', CS_SOURCE_SYSTEM, 2016],
    ['marketing year undefined', CS_SOURCE_SYSTEM, undefined],
    ['marketing year null', CS_SOURCE_SYSTEM, null]
  ])('should return unchanged payment request when %s', (_, sourceSystem, marketingYear) => {
    paymentRequest.sourceSystem = sourceSystem
    paymentRequest.marketingYear = marketingYear

    const result = correctCSMarketingYear(paymentRequest)

    expect(result).toStrictEqual(paymentRequest)
  })

  test('should prefix marketing year with 20 when marketing year > 16', () => {
    paymentRequest.marketingYear = 17

    const result = correctCSMarketingYear(paymentRequest)

    expect(result.marketingYear).toBe(2017)
  })
})
