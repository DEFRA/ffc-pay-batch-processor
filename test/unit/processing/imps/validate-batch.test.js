jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')
const validateBatch = require('../../../../app/processing/imps/validate-batch')

let batchHeader
let paymentRequest

describe('Validate batch', () => {
  beforeEach(() => {
    batchHeader = structuredClone(require('../../../mocks/imps-batch-header'))
    paymentRequest = structuredClone(require('../../../mocks/payment-request').paymentRequest)

    convertToPence.mockImplementation(() => batchHeader.batchValue)
    getTotalValueInPence.mockImplementation(() => paymentRequest.value)
  })

  test('returns true if batch is valid', async () => {
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeTruthy()
  })

  describe('returns false for invalid batches', () => {
    test.each([
      ['no batch headers', [], [paymentRequest]],
      ['more than one batch header', [batchHeader, batchHeader], [paymentRequest]],
      ['batch value missing', [{ ...batchHeader, batchValue: undefined }], [paymentRequest]],
      ['expected number of payment requests less than actual', [{ ...batchHeader, numberOfPaymentRequests: 0 }], [paymentRequest]],
      ['expected number of payment requests more than actual', [{ ...batchHeader, numberOfPaymentRequests: 2 }], [paymentRequest]],
      ['unknown ledger', [{ ...batchHeader, ledger: 'unknown' }], [paymentRequest]],
      ['ledger missing', [{ ...batchHeader, ledger: undefined }], [paymentRequest]],
      ['export date DD-MM-YYYY', [{ ...batchHeader, exportDate: '28-06-2022' }], [paymentRequest]],
      ['export date yyyy-mm-dd', [{ ...batchHeader, exportDate: '2022-06-28' }], [paymentRequest]],
      ['export date YYYY/MM/DD', [{ ...batchHeader, exportDate: '2022/06/28' }], [paymentRequest]],
      ['export date missing', [{ ...batchHeader, exportDate: undefined }], [paymentRequest]],
      ['sequence undefined', [{ ...batchHeader, sequence: undefined }], [paymentRequest]],
      ['sequence negative', [{ ...batchHeader, sequence: -3 }], [paymentRequest]],
      ['sequence is float', [{ ...batchHeader, sequence: 3.2 }], [paymentRequest]],
      ['sourceSystem undefined', [{ ...batchHeader, sourceSystem: undefined }], [paymentRequest]]
    ])('%s', async (_, headers, requests) => {
      const result = await validateBatch(headers, requests)
      expect(result).toBeFalsy()
    })
  })
})
