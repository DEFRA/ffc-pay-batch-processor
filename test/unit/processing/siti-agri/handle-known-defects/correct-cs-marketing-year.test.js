const { cs, sfi } = require('../../../../../app/schemes')

const { correctCSMarketingYear } = require('../../../../../app/processing/siti-agri/handle-known-defects/correct-cs-marketing-year')

let paymentRequest

describe('correct CS marketing year', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))
    paymentRequest.sourceSystem = cs.sourceSystem
  })

  test('Should return unchanged payment request when scheme is not CS', () => {
    paymentRequest.sourceSystem = sfi.sourceSystem
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged payment request when marketing year is less than 16', () => {
    paymentRequest.marketingYear = 15
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged payment request when marketing year is already 4 digits', () => {
    paymentRequest.marketingYear = 2016
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged payment request when marketing year is undefined', () => {
    paymentRequest.marketingYear = undefined
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged payment request when marketing year is null', () => {
    paymentRequest.marketingYear = null
    const result = correctCSMarketingYear(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('should prefix marketing year with 20 when marketing year is greater than 16', () => {
    paymentRequest.marketingYear = 17
    const result = correctCSMarketingYear(paymentRequest)
    expect(result.marketingYear).toBe(2017)
  })
})
