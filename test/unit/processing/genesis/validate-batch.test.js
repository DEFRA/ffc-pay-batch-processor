jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

const validateBatch = require('../../../../app/processing/genesis/validate-batch')

let batchHeader
let paymentRequest

describe('Validate batch', () => {
  beforeEach(() => {
    batchHeader = JSON.parse(JSON.stringify(require('../../../mocks/es-batch-header')))
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

  test('returns false if batch value missing', async () => {
    batchHeader.batchValue = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if expected number of payment requests is less than actual', async () => {
    batchHeader.numberOfPaymentRequests = 0
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if expected number of payment requests is more than actual', async () => {
    batchHeader.numberOfPaymentRequests = 2
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if unknown ledger', async () => {
    batchHeader.ledger = 'unknown'
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if ledger missing', async () => {
    batchHeader.ledger = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if export date DD-MM-YYYY', async () => {
    batchHeader.exportDate = '28-06-2022'
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if export date yyyy-mm-dd', async () => {
    batchHeader.exportDate = '2022-06-28'
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if export date YYYY/MM/DD', async () => {
    batchHeader.exportDate = '2022/06/28'
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if export date missing', async () => {
    batchHeader.exportDate = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if sequence is undefined', async () => {
    batchHeader.sequence = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if sequence is a negative number', async () => {
    batchHeader.sequence = -3
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if sequence is a float', async () => {
    batchHeader.sequence = 3.2
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if sourceSystem is undefined', async () => {
    batchHeader.sourceSystem = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns true when batch header value matches payment request value', async () => {
    batchHeader.batchValue = paymentRequest.value
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })

  test('returns false when batch header value is more than payment request value', async () => {
    batchHeader.batchValue = paymentRequest.value + 50
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false when batch header value is less than payment request value', async () => {
    batchHeader.batchValue = paymentRequest.value - 50
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false when payment request value is more than batch header value', async () => {
    paymentRequest.value = batchHeader.batchValue + 50
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false when payment request value is less than batch header value', async () => {
    paymentRequest.value = batchHeader.batchValue - 50
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })
})
