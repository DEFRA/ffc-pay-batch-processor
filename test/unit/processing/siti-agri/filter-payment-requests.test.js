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
  let sourceSystem

  let paymentRequest
  let paymentRequests

  let mappedPaymentRequest
  let mappedPaymentRequests

  let mappedInvoiceLines

  beforeEach(() => {
    paymentRequest = require('../../../mockPaymentRequest').paymentRequest
    paymentRequests = require('../../../mockPaymentRequest').paymentRequests
    mappedPaymentRequest = require('../../../mockPaymentRequest').mappedPaymentRequest
    mappedPaymentRequests = require('../../../mockPaymentRequest').mappedPaymentRequests

    mappedInvoiceLines = require('../../../mockInvoiceLines').mappedInvoiceLines

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
    paymentRequests = [paymentRequest, paymentRequest]
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(buildPaymentRequests).toBeCalledTimes(1)
  })

  test('should call buildPaymentRequests with each mappedPaymentRequests and sourceSystem when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
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
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalledTimes(2)
  })

  test('should call paymentRequestSchema.validate with each mappedPaymentRequests and { abortEarly: false } when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
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
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with each mappedPaymentRequests.invoiceLines[0] when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].invoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].invoiceLines[0])
  })

  test('should call isInvoiceLineValid twice when buildPaymentRequests returns a mappedPaymentRequest with 2 invoiceLines', async () => {
    mappedInvoiceLines.push(mappedInvoiceLines[0])
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with mappedInvoiceLines both times when buildPaymentRequests returns a mappedPaymentRequest with 2 invoiceLines', async () => {
    mappedInvoiceLines.push(mappedInvoiceLines[0])
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, mappedInvoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, mappedInvoiceLines[1])
  })

  test('should not call isInvoiceLineValid when buildPaymentRequests returns an empty array', async () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(isInvoiceLineValid).not.toBeCalled()
  })

  test('should call convertToPence when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalled()
  })

  test('should call convertToPence once when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalledTimes(1)
  })

  test('should call convertToPence with paymentRequest.value when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalledWith(paymentRequest.value)
  })

  test('should call convertToPence twice when buildPaymentRequests returns 2 mappedPaymentRequests paymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(convertToPence).toBeCalledTimes(2)
  })

  test('should call convertToPence with each mappedPaymentRequests.value when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(convertToPence).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].value)
    expect(convertToPence).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].value)
  })

  test('should not call convertToPence when buildPaymentRequests returns an empty array', async () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(convertToPence).not.toBeCalled()
  })

  test('should call getTotalValueInPence when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalled()
  })

  test('should call getTotalValueInPence once when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledTimes(1)
  })

  test('should call getTotalValueInPence with mappedPaymentRequest.invoiceLines and "value" when buildPaymentRequests returns mappedPaymentRequests', async () => {
    filterPaymentRequest(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledWith(mappedPaymentRequest.invoiceLines, 'value')
  })

  test('should call getTotalValueInPence twice when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(getTotalValueInPence).toBeCalledTimes(2)
  })

  test('should call getTotalValueInPence with each mappedPaymentRequests.invoiceLines and "value" when buildPaymentRequests returns 2 mappedPaymentRequests', async () => {
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(getTotalValueInPence).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].invoiceLines, 'value')
    expect(getTotalValueInPence).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].invoiceLines, 'value')
  })

  test('should call getTotalValueInPence once when buildPaymentRequests returns a mappedPaymentRequests with 2 invoiceLines', async () => {
    mappedInvoiceLines.push(mappedInvoiceLines[0])
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(getTotalValueInPence).toBeCalledTimes(1)
  })

  test('should call getTotalValueInPence with mappedInvoiceLines and "value" when buildPaymentRequests returns a mappedPaymentRequests with 2 invoiceLines', async () => {
    mappedInvoiceLines.push(mappedInvoiceLines[0])
    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

    filterPaymentRequest(paymentRequests, sourceSystem)

    expect(getTotalValueInPence).toHaveBeenCalledWith(mappedInvoiceLines, 'value')
  })

  test('should not call getTotalValueInPence when buildPaymentRequests returns an empty array', async () => {
    buildPaymentRequests.mockReturnValue([])
    filterPaymentRequest([], sourceSystem)
    expect(getTotalValueInPence).not.toBeCalled()
  })
})
