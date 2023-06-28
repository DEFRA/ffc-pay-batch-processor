jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../../app/processing/genesis/build-invoice-lines')
const { buildInvoiceLines } = require('../../../../app/processing/genesis/build-invoice-lines')

const correlationId = require('../../../mocks/correlation-id')

const buildPaymentRequests = require('../../../../app/processing/genesis/build-payment-requests')

let paymentRequest
let paymentRequests

let mappedPaymentRequest
let mappedPaymentRequests

let invoiceLines
let mappedInvoiceLines

let sourceSystem

describe('Build payment requests', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequests))

    mappedPaymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequest))
    mappedPaymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequests))

    invoiceLines = JSON.parse(JSON.stringify(require('../../../mocks/invoice-lines').invoiceLines))
    mappedInvoiceLines = JSON.parse(JSON.stringify(require('../../../mocks/invoice-lines').mappedInvoiceLines))

    sourceSystem = paymentRequest.sourceSystem

    uuidv4.mockReturnValue(correlationId)
    buildInvoiceLines.mockReturnValue(mappedInvoiceLines)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalled()
  })

  test('should call uuidv4 once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalledTimes(1)
  })

  test('should call uuidv4 twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalledTimes(2)
  })

  test('should not call uuidv4 when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(uuidv4).not.toBeCalled()
  })

  test('should call buildInvoiceLines when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalled()
  })

  test('should call buildInvoiceLines once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalledTimes(1)
  })

  test('should call buildInvoiceLines with paymentRequest.invoiceLines when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalledWith(paymentRequest.invoiceLines)
  })

  test('should call buildInvoiceLines twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)
    expect(buildInvoiceLines).toBeCalledTimes(2)
  })

  test('should call buildInvoiceLines with each paymentRequests.invoiceLines when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenNthCalledWith(1, paymentRequests[0].invoiceLines)
    expect(buildInvoiceLines).toHaveBeenNthCalledWith(2, paymentRequests[1].invoiceLines)
  })

  test('should not call buildInvoiceLines when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(buildInvoiceLines).not.toBeCalled()
  })

  test('should return mappedPaymentRequests when valid paymentRequests and sourceSystem are given', async () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toMatchObject(mappedPaymentRequests)
  })
})
