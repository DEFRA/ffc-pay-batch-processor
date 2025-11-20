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
    const mocks = require('../../../mocks/payment-request')
    const invoiceMocks = require('../../../mocks/invoice-lines')

    paymentRequest = structuredClone(mocks.paymentRequest)
    paymentRequests = structuredClone(mocks.paymentRequests)
    mappedPaymentRequest = structuredClone(mocks.mappedPaymentRequest)
    unsuccessfulMappedPaymentRequest = structuredClone(mocks.unsuccessfulMappedPaymentRequest)
    mappedPaymentRequests = structuredClone(mocks.mappedPaymentRequests)
    mappedInvoiceLines = structuredClone(invoiceMocks.mappedInvoiceLines)

    sourceSystem = paymentRequest.sourceSystem

    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest })
    isInvoiceLineValid.mockReturnValue(true)
  })

  afterEach(() => jest.resetAllMocks())

  describe('buildPaymentRequests behavior', () => {
    test('calls buildPaymentRequests with normal array of paymentRequests', () => {
      filterPaymentRequest(paymentRequests, sourceSystem)
      expect(buildPaymentRequests).toBeCalledTimes(1)
      expect(buildPaymentRequests).toBeCalledWith(paymentRequests, sourceSystem)
    })

    test('calls buildPaymentRequests with empty array', () => {
      filterPaymentRequest([], sourceSystem)
      expect(buildPaymentRequests).toBeCalledTimes(1)
      expect(buildPaymentRequests).toBeCalledWith([], sourceSystem)
    })

    test('calls buildPaymentRequests with array containing 2 paymentRequests', () => {
      const twoRequests = [...paymentRequests, paymentRequest]
      filterPaymentRequest(twoRequests, sourceSystem)
      expect(buildPaymentRequests).toBeCalledTimes(1)
      expect(buildPaymentRequests).toBeCalledWith(twoRequests, sourceSystem)
    })
  })

  describe('schema validation', () => {
    test('calls validate for each mapped payment request', () => {
      const doubleMapped = [...mappedPaymentRequests, structuredClone(mappedPaymentRequest)]
      buildPaymentRequests.mockReturnValue(doubleMapped)

      filterPaymentRequest(paymentRequests, sourceSystem)

      doubleMapped.forEach((req, i) => {
        expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(
          i + 1,
          req,
          { abortEarly: false }
        )
      })
    })

    test('does not call validate when mappedPaymentRequests is empty', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(paymentRequestSchema.validate).not.toBeCalled()
    })
  })

  describe('invoice line validation', () => {
    test('calls isInvoiceLineValid for each invoice line', () => {
      mappedPaymentRequest.invoiceLines = [mappedInvoiceLines[0], mappedInvoiceLines[1]]
      buildPaymentRequests.mockReturnValue([mappedPaymentRequest])

      filterPaymentRequest(paymentRequests, sourceSystem)

      mappedPaymentRequest.invoiceLines.forEach((line, i) => {
        expect(isInvoiceLineValid).toHaveBeenNthCalledWith(i + 1, line)
      })
    })

    test('does not call isInvoiceLineValid when mappedPaymentRequests is empty', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(isInvoiceLineValid).not.toBeCalled()
    })
  })

  describe('result handling', () => {
    test('successfulPaymentRequests contains valid mapped requests', () => {
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.successfulPaymentRequests).toContainEqual(mappedPaymentRequest)
      expect(result.unsuccessfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
    })

    test('unsuccessfulPaymentRequests when schema validation fails', () => {
      paymentRequestSchema.validate.mockReturnValue({ error: { message: 'Example error' } })
      unsuccessfulMappedPaymentRequest.errorMessage =
        'Payment request for FRN: 1234567890 - SITI1234567 ' +
        'from batch SITISFI0001_AP_20230306115413497.dat is invalid, ' +
        'Payment request content is invalid, Example error. '

      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
      expect(result.unsuccessfulPaymentRequests).toContainEqual(unsuccessfulMappedPaymentRequest)
    })

    test('unsuccessfulPaymentRequests when invoice line validation fails', () => {
      isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'Example error' })

      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
      expect(result.unsuccessfulPaymentRequests).toContainEqual(unsuccessfulMappedPaymentRequest)
    })
  })
})
