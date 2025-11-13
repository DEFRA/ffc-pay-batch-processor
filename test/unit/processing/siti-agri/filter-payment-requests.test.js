jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

jest.mock('../../../../app/processing/siti-agri/schemas/payment-request')
const paymentRequestSchema = require('../../../../app/processing/siti-agri/schemas/payment-request')

jest.mock('../../../../app/processing/siti-agri/build-invoice-lines')
const { isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

jest.mock('../../../../app/processing/siti-agri/build-payment-requests')
const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

const filterPaymentRequest = require('../../../../app/processing/siti-agri/filter-payment-requests')

describe('Filter payment requests', () => {
  let paymentRequest, paymentRequests
  let mappedPaymentRequest, mappedPaymentRequests
  let mappedInvoiceLines
  let sourceSystem

  const setupMocks = (overrides = {}) => {
    paymentRequest = structuredClone(require('../../../mocks/payment-request').paymentRequest)
    paymentRequests = [paymentRequest]
    mappedPaymentRequest = structuredClone(require('../../../mocks/payment-request').mappedPaymentRequest)
    mappedPaymentRequests = [mappedPaymentRequest]
    mappedInvoiceLines = structuredClone(require('../../../mocks/invoice-lines').mappedInvoiceLines)
    sourceSystem = paymentRequest.sourceSystem

    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest })
    isInvoiceLineValid.mockReturnValue(true)
    convertToPence.mockReturnValue(10000)
    getTotalValueInPence.mockReturnValue(10000)

    Object.assign(paymentRequest, overrides)
  }

  beforeEach(() => setupMocks())
  afterEach(() => jest.resetAllMocks())

  const callFilter = () => filterPaymentRequest(paymentRequests, sourceSystem)

  // --- Basic buildPaymentRequests tests ---
  test('calls buildPaymentRequests with correct args', () => {
    callFilter()
    expect(buildPaymentRequests).toBeCalledWith(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalledTimes(1)
  })

  test('handles empty paymentRequests', () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(paymentRequestSchema.validate).not.toBeCalled()
    expect(isInvoiceLineValid).not.toBeCalled()
    expect(convertToPence).not.toBeCalled()
    expect(getTotalValueInPence).not.toBeCalled()
  })

  test('validates each mapped payment request', () => {
    callFilter()
    expect(paymentRequestSchema.validate).toBeCalledWith(mappedPaymentRequest, { abortEarly: false })
    expect(paymentRequestSchema.validate).toBeCalledTimes(1)

    mappedPaymentRequests.push(mappedPaymentRequest)
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    callFilter()
    expect(paymentRequestSchema.validate).toBeCalledTimes(3) // 1 previous + 2 new
  })

  test('validates each invoice line', () => {
    callFilter()
    expect(isInvoiceLineValid).toBeCalledWith(mappedPaymentRequest.invoiceLines[0])
    expect(isInvoiceLineValid).toBeCalledTimes(1)

    mappedPaymentRequest.invoiceLines.push(mappedInvoiceLines[0])
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    callFilter()
    expect(isInvoiceLineValid).toBeCalledTimes(3) // 1 previous + 2 new
  })

  test('calls convertToPence and getTotalValueInPence for value matching', () => {
    callFilter()
    expect(convertToPence).toBeCalledWith(mappedPaymentRequest.value)
    expect(getTotalValueInPence).toBeCalledWith(mappedPaymentRequest.invoiceLines, 'value')
    expect(convertToPence).toBeCalledTimes(1)
    expect(getTotalValueInPence).toBeCalledTimes(1)
  })

  test('returns successful and unsuccessful payment requests correctly', () => {
    const result = callFilter()
    expect(result.successfulPaymentRequests).toContainEqual(mappedPaymentRequest)
    expect(result.unsuccessfulPaymentRequests).toHaveLength(0)
  })

  test('fails validation moves request to unsuccessful', () => {
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest, error: { message: 'fail' } })
    const result = callFilter()
    expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
    expect(result.unsuccessfulPaymentRequests).toContainEqual(expect.objectContaining({ frn: mappedPaymentRequest.frn }))
  })

  test('fails invoice line validation moves request to unsuccessful', () => {
    isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'fail' })
    const result = callFilter()
    expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
    expect(result.unsuccessfulPaymentRequests).toContainEqual(expect.objectContaining({ frn: mappedPaymentRequest.frn }))
  })

  test('fails value check moves request to unsuccessful', () => {
    convertToPence.mockReturnValue(getTotalValueInPence() + 50)
    const result = callFilter()
    expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
    expect(result.unsuccessfulPaymentRequests).toContainEqual(expect.objectContaining({ frn: mappedPaymentRequest.frn }))
  })
})
