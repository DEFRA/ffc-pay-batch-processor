const { cs, sfi } = require('../../../../../app/constants/schemes')
const { correctCSMarketingYear } = require('../../../../../app/processing/siti-agri/handle-known-defects/correct-cs-marketing-year')

let paymentRequest

describe('correct CS marketing year', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../../mocks/payment-request').paymentRequest)
    paymentRequest.sourceSystem = cs.sourceSystem
  })

  test.each([
    ['scheme is not CS', sfi.sourceSystem, 20],
    ['marketing year < 16', cs.sourceSystem, 15],
    ['marketing year already 4 digits', cs.sourceSystem, 2016],
    ['marketing year undefined', cs.sourceSystem, undefined],
    ['marketing year null', cs.sourceSystem, null]
  ])('Should return unchanged payment request when %s', (_, sourceSystem, marketingYear) => {
    paymentRequest.sourceSystem = sourceSystem
    paymentRequest.marketingYear = marketingYear
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should prefix marketing year with 20 when marketing year > 16', () => {
    paymentRequest.marketingYear = 17
    const result = correctCSMarketingYear(paymentRequest)
    expect(result.marketingYear).toBe(2017)
  })
})
