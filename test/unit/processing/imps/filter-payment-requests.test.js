jest.mock('../../../../app/processing/imps/schemas/payment-request')
const paymentRequestSchema = require('../../../../app/processing/imps/schemas/payment-request')

jest.mock('../../../../app/processing/imps/build-invoice-lines')
const { isInvoiceLineValid } = require('../../../../app/processing/imps/build-invoice-lines')

jest.mock('../../../../app/processing/imps/build-payment-requests')
const buildPaymentRequests = require('../../../../app/processing/imps/build-payment-requests')

const filterPaymentRequest = require('../../../../app/processing/imps/filter-payment-requests')

let paymentRequest
let paymentRequests

let mappedPaymentRequest
let unsuccessfulMappedPaymentRequest
let mappedPaymentRequests

let mappedInvoiceLines

let sourceSystem

describe('Filter payment requests', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequests))

    mappedPaymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequest))
    unsuccessfulMappedPaymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').unsuccessfulMappedPaymentRequest))
    mappedPaymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequests))

    mappedInvoiceLines = JSON.parse(JSON.stringify(require('../../../mocks/invoice-lines').mappedInvoiceLines))

    sourceSystem = paymentRequest.sourceSystem

    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest })
    isInvoiceLineValid.mockReturnValue(true)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call buildPaymentRequests when valid paymentRequests and sourceSystem are given', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalled()
  })

  test('should call buildPaymentRequests once when valid paymentRequests and sourceSystem are given', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalledTimes(1)
  })

  test('should call buildPaymentRequests with paymentRequests and sourceSystem when valid paymentRequests and sourceSystem are given', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalledWith(paymentRequests, sourceSystem)
  })

  test('should call buildPaymentRequests once when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests.push(paymentRequest)
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalledTimes(1)
  })

  test('should call buildPaymentRequests with each mappedPaymentRequests and sourceSystem when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests.push(paymentRequest)
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toHaveBeenCalledWith(paymentRequests, sourceSystem)
  })

  test('should call buildPaymentRequests when an empty paymentRequests array and valid sourceSystem are given', async () => {
    filterPaymentRequest([], sourceSystem)
    expect(buildPaymentRequests).toBeCalled()
  })

  test('should call buildPaymentRequests once when an empty paymentRequests array and valid sourceSystem are given', async () => {
    filterPaymentRequest([], sourceSystem)
    expect(buildPaymentRequests).toBeCalledTimes(1)
  })

  test('should call buildPaymentRequests with an empty array and sourceSystem when an empty paymentRequests array and valid sourceSystem are given', async () => {
    filterPaymentRequest([], sourceSystem)
    expect(buildPaymentRequests).toBeCalledWith([], sourceSystem)
  })

  test('should call paymentRequestSchema.validate when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalled()
  })

  test('should call paymentRequestSchema.validate once when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalledTimes(1)
  })

  test('should call paymentRequestSchema.validate with mappedPaymentRequest and { abortEarly: false } when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalledWith(mappedPaymentRequest, { abortEarly: false })
  })

  test('should call paymentRequestSchema.validate twice when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests.push(mappedPaymentRequest)
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalledTimes(2)
  })

  test('should call paymentRequestSchema.validate with each mappedPaymentRequests and { abortEarly: false } when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests.push(mappedPaymentRequest)
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0], { abortEarly: false })
    expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1], { abortEarly: false })
  })

  test('should not call paymentRequestSchema.validate when buildPaymentRequests returns an empty array', async () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(paymentRequestSchema.validate).not.toBeCalled()
  })

  test('should call paymentRequestSchema.validate when buildPaymentRequests returns mappedPaymentRequests with empty invoiceLines', async () => {
    mappedPaymentRequest.invoiceLines = []
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalled()
  })

  test('should call paymentRequestSchema.validate once when buildPaymentRequests returns mappedPaymentRequests with empty invoiceLines', async () => {
    mappedPaymentRequest.invoiceLines = []
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalledTimes(1)
  })

  test('should call paymentRequestSchema.validate with mappedPaymentRequest and { abortEarly: false } when buildPaymentRequests returns mappedPaymentRequests with empty invoiceLines', async () => {
    mappedPaymentRequest.invoiceLines = []
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalledWith(mappedPaymentRequest, { abortEarly: false })
  })

  test('should call isInvoiceLineValid when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalled()
  })

  test('should call isInvoiceLineValid once when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledTimes(1)
  })

  test('should call isInvoiceLineValid with mappedPaymentRequest.invoiceLines[0] when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledWith(mappedPaymentRequest.invoiceLines[0])
  })

  test('should call isInvoiceLineValid twice when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests.push(mappedPaymentRequest)
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with each mappedPaymentRequests.invoiceLines[0] when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests.push(mappedPaymentRequest)
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].invoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].invoiceLines[0])
  })

  test('should call isInvoiceLineValid twice when buildPaymentRequests returns a mappedPaymentRequest with 2 invoiceLines', async () => {
    mappedPaymentRequest.invoiceLines = [mappedInvoiceLines[0], mappedInvoiceLines[0]]
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with each mappedPaymentRequest.invoiceLines when buildPaymentRequests returns a mappedPaymentRequest with 2 invoiceLines', async () => {
    mappedPaymentRequest.invoiceLines = [mappedInvoiceLines[0], mappedInvoiceLines[0]]
    mappedPaymentRequests = [mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, mappedPaymentRequest.invoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, mappedPaymentRequest.invoiceLines[1])
  })

  test('should not call isInvoiceLineValid when buildPaymentRequests returns an empty array', async () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(isInvoiceLineValid).not.toBeCalled()
  })

  test('should return mappedPaymentRequest under successfulPaymentRequests when buildPaymentRequests returns mappedPaymentRequests', async () => {
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.successfulPaymentRequests).toContainEqual(mappedPaymentRequest)
  })

  test('should not return mappedPaymentRequest under unsuccessfulPaymentRequests when buildPaymentRequests returns mappedPaymentRequests', async () => {
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.unsuccessfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
  })

  test('should not return mappedPaymentRequest under successfulPaymentRequests when paymentRequestSchema.validate returns with an error key', async () => {
    paymentRequestSchema.validate.mockReturnValue({ ...paymentRequestSchema.validate(), error: { message: 'Example error' } })
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
  })

  test('should return unsuccessfulMappedPaymentRequest under unsuccessfulPaymentRequests when paymentRequestSchema.validate returns with an error key', async () => {
    paymentRequestSchema.validate.mockReturnValue({ ...paymentRequestSchema.validate(), error: { message: 'Example error' } })
    unsuccessfulMappedPaymentRequest.errorMessage = 'Payment request for FRN: 1234567890 - SITI1234567 is invalid, Payment request content is invalid, Example error. '
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.unsuccessfulPaymentRequests).toContainEqual(unsuccessfulMappedPaymentRequest)
  })

  test('should not return mappedPaymentRequest under successfulPaymentRequests when isInvoiceLineValid returns false', async () => {
    isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'Example error' })
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
  })

  test('should return unsuccessfulMappedPaymentRequest under unsuccessfulPaymentRequests when isInvoiceLineValid returns false', async () => {
    isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'Example error' })
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    expect(result.unsuccessfulPaymentRequests).toContainEqual(unsuccessfulMappedPaymentRequest)
  })
})
