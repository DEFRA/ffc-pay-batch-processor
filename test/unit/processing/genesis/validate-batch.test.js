jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

const validateBatch = require('../../../../app/processing/genesis/validate-batch')

let batchHeader
let paymentRequest

describe('validateBatch', () => {
  beforeEach(() => {
    batchHeader = structuredClone(require('../../../mocks/es-batch-header'))
    paymentRequest = structuredClone(require('../../../mocks/payment-request').paymentRequest)

    convertToPence.mockImplementation(() => batchHeader.batchValue)
    getTotalValueInPence.mockImplementation(() => paymentRequest.value)
  })

  test('returns true if batch valid', async () => {
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })

  test.each([
    { description: 'no batch headers', headers: [], expected: false },
    { description: 'more than one batch header', headers: () => [batchHeader, batchHeader], expected: false },
    { description: 'batch value missing', headers: () => ({ ...batchHeader, batchValue: undefined }), expected: false },
    { description: 'expected number of payment requests less than actual', headers: () => ({ ...batchHeader, numberOfPaymentRequests: 0 }), expected: false },
    { description: 'expected number of payment requests more than actual', headers: () => ({ ...batchHeader, numberOfPaymentRequests: 2 }), expected: false },
    { description: 'unknown ledger', headers: () => ({ ...batchHeader, ledger: 'unknown' }), expected: false },
    { description: 'ledger missing', headers: () => ({ ...batchHeader, ledger: undefined }), expected: false },
    { description: 'export date DD-MM-YYYY', headers: () => ({ ...batchHeader, exportDate: '28-06-2022' }), expected: false },
    { description: 'export date yyyy-mm-dd', headers: () => ({ ...batchHeader, exportDate: '2022-06-28' }), expected: false },
    { description: 'export date YYYY/MM/DD', headers: () => ({ ...batchHeader, exportDate: '2022/06/28' }), expected: false },
    { description: 'export date missing', headers: () => ({ ...batchHeader, exportDate: undefined }), expected: false },
    { description: 'sequence undefined', headers: () => ({ ...batchHeader, sequence: undefined }), expected: false },
    { description: 'sequence negative number', headers: () => ({ ...batchHeader, sequence: -3 }), expected: false },
    { description: 'sequence float', headers: () => ({ ...batchHeader, sequence: 3.2 }), expected: false },
    { description: 'sourceSystem undefined', headers: () => ({ ...batchHeader, sourceSystem: undefined }), expected: false }
  ])('returns $expected when $description', async ({ headers, expected }) => {
    const headerArray = typeof headers === 'function' ? [headers()] : headers
    const result = await validateBatch(headerArray, [paymentRequest])
    expect(result).toBe(expected)
  })

  test('returns true when batch header value matches payment request value', async () => {
    batchHeader.batchValue = paymentRequest.value
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })

  test.each([
    { description: 'batch header value more than payment request value', batchValue: () => paymentRequest.value + 50, expected: false },
    { description: 'batch header value less than payment request value', batchValue: () => paymentRequest.value - 50, expected: false },
    { description: 'payment request value more than batch header value', paymentValue: () => batchHeader.batchValue + 50, expected: false },
    { description: 'payment request value less than batch header value', paymentValue: () => batchHeader.batchValue - 50, expected: false }
  ])('returns $expected when $description', async ({ batchValue, paymentValue, expected }) => {
    if (batchValue) batchHeader.batchValue = batchValue()
    if (paymentValue) paymentRequest.value = paymentValue()
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBe(expected)
  })
})
