jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

const validateBatch = require('../../../../app/processing/siti-agri/validate-batch')

let batchHeader
let paymentRequest

describe('validateBatch', () => {
  beforeEach(() => {
    batchHeader = JSON.parse(JSON.stringify(require('../../../mocks/batch-header')))
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))

    convertToPence.mockImplementation(() => batchHeader.batchValue)
    getTotalValueInPence.mockImplementation(() => paymentRequest.value)
  })

  test('returns true if batch valid', async () => {
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })

  test('returns false if no batch headers', async () => {
    const result = await validateBatch([], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if more than one batch header', async () => {
    const result = await validateBatch([batchHeader, batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  describe('invalid batch scenarios', () => {
    test.each([
      ['batch value missing', () => { batchHeader.batchValue = undefined }],
      ['unknown ledger', () => { batchHeader.ledger = 'unknown' }],
      ['ledger missing', () => { batchHeader.ledger = undefined }],
      ['export date DD-MM-YYYY', () => { batchHeader.exportDate = '28-06-2022' }],
      ['export date DD/MM/YYYY', () => { batchHeader.exportDate = '28/06/2022' }],
      ['export date YYYY/MM/DD', () => { batchHeader.exportDate = '2022/06/28' }],
      ['export date missing', () => { batchHeader.exportDate = undefined }],
      ['sequence undefined', () => { batchHeader.sequence = undefined }],
      ['sequence negative', () => { batchHeader.sequence = -3 }],
      ['sequence float', () => { batchHeader.sequence = 3.2 }],
      ['sourceSystem undefined', () => { batchHeader.sourceSystem = undefined }],
      ['expected payment requests less than actual', () => { batchHeader.numberOfPaymentRequests = 0 }],
      ['expected payment requests more than actual', () => { batchHeader.numberOfPaymentRequests = 2 }]
    ])('returns false if %s', async (_, mutate) => {
      mutate()
      const result = await validateBatch([batchHeader], [paymentRequest])
      expect(result).toBeFalsy()
    })

    test.each([
      ['batch header value more than payment request', () => { batchHeader.batchValue = paymentRequest.value + 50 }],
      ['batch header value less than payment request', () => { batchHeader.batchValue = paymentRequest.value - 50 }],
      ['payment request value more than batch header', () => { paymentRequest.value = batchHeader.batchValue + 50 }],
      ['payment request value less than batch header', () => { paymentRequest.value = batchHeader.batchValue - 50 }]
    ])('returns false when %s', async (_, mutate) => {
      mutate()
      const result = await validateBatch([batchHeader], [paymentRequest])
      expect(result).toBeFalsy()
    })
  })

  test('returns true when batch header value matches payment request value', async () => {
    batchHeader.batchValue = paymentRequest.value
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })
})
