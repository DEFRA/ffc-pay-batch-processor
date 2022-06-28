const { AP } = require('../../../../app/ledgers')
const validateBatch = require('../../../../app/processing/siti-agri/validate-batch')
const { sfi } = require('../../../../app/schemes')
let batchHeader
let paymentRequest
describe('Validate batch', () => {
  beforeEach(() => {
    batchHeader = {
      exportDate: '2022-06-28',
      numberOfPaymentRequests: 1,
      batchValue: 100,
      sequence: 1,
      sourceSystem: sfi.sourceSystem,
      ledger: AP
    }
    paymentRequest = {
      value: 100,
      invoiceLines: [{
        value: 50
      }, {
        value: 50
      }]
    }
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

  test('returns false if batch value does not match payment request value', async () => {
    batchHeader.batchValue = 200
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if batch value missing', async () => {
    batchHeader.batchValue = undefined
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })

  test('returns false if expected number of payment requests not correct', async () => {
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

  test('returns false if export date DD/MM/YYYY', async () => {
    batchHeader.exportDate = '28/06/2022'
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

  test('returns false if unknown ledger', async () => {
    batchHeader.ledger = 'unknown'
    const result = await validateBatch([batchHeader], [paymentRequest])
    expect(result).toBeFalsy()
  })
})
