jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

jest.mock('../../../../app/processing/genesis/schemas/payment-request')
const paymentRequestSchema = require('../../../../app/processing/genesis/schemas/payment-request')

jest.mock('../../../../app/processing/genesis/build-invoice-lines')
const { isInvoiceLineValid } = require('../../../../app/processing/genesis/build-invoice-lines')

jest.mock('../../../../app/processing/genesis/build-payment-requests')
const buildPaymentRequests = require('../../../../app/processing/genesis/build-payment-requests')

const filterPaymentRequest = require('../../../../app/processing/genesis/filter-payment-requests')

let paymentRequest
let paymentRequests

let mappedPaymentRequest
let unsuccessfulMappedPaymentRequest
let mappedPaymentRequests

let mappedInvoiceLines

let sourceSystem

describe('filterPaymentRequests', () => {
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
    convertToPence.mockReturnValue(10000)
    getTotalValueInPence.mockReturnValue(10000)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('buildPaymentRequests calls', () => {
    const testCases = [
      { arr: () => paymentRequests, desc: 'valid paymentRequests' },
      { arr: () => [...paymentRequests, paymentRequest], desc: '2 paymentRequests' },
      { arr: () => [], desc: 'empty paymentRequests' }
    ]

    test.each(testCases)('should call buildPaymentRequests once when $desc and sourceSystem are given', ({ arr }) => {
      const actualArr = arr()
      filterPaymentRequest(actualArr, sourceSystem)
      expect(buildPaymentRequests).toBeCalledTimes(1)
      expect(buildPaymentRequests).toHaveBeenCalledWith(actualArr, sourceSystem)
    })
  })

  describe('paymentRequestSchema.validate calls', () => {
    test('should call paymentRequestSchema.validate for each mappedPaymentRequest with { abortEarly: false }', () => {
      mappedPaymentRequests.push(mappedPaymentRequest)
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      mappedPaymentRequests.forEach((mp, index) => {
        expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(index + 1, mp, { abortEarly: false })
      })
    })

    test('should not call paymentRequestSchema.validate for empty mappedPaymentRequests', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(paymentRequestSchema.validate).not.toBeCalled()
    })
  })

  describe('isInvoiceLineValid calls', () => {
    test('should call isInvoiceLineValid for each invoiceLine of mappedPaymentRequests', () => {
      mappedPaymentRequest.invoiceLines.push(mappedInvoiceLines[0])
      mappedPaymentRequests = [mappedPaymentRequest]
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      expect(isInvoiceLineValid).toHaveBeenCalledTimes(mappedPaymentRequest.invoiceLines.length)
      mappedPaymentRequest.invoiceLines.forEach((line, index) => {
        expect(isInvoiceLineValid).toHaveBeenNthCalledWith(index + 1, line)
      })
    })

    test('should not call isInvoiceLineValid for empty mappedPaymentRequests', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(isInvoiceLineValid).not.toBeCalled()
    })
  })

  describe('convertToPence calls', () => {
    test('should call convertToPence for each mappedPaymentRequest.value', () => {
      mappedPaymentRequests.push(mappedPaymentRequest)
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      mappedPaymentRequests.forEach((mp, index) => {
        expect(convertToPence).toHaveBeenNthCalledWith(index + 1, mp.value)
      })
    })

    test('should not call convertToPence for empty mappedPaymentRequests', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(convertToPence).not.toBeCalled()
    })
  })

  describe('getTotalValueInPence calls', () => {
    test('should call getTotalValueInPence for each mappedPaymentRequest.invoiceLines', () => {
      mappedPaymentRequests.push(mappedPaymentRequest)
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      mappedPaymentRequests.forEach((mp, index) => {
        expect(getTotalValueInPence).toHaveBeenNthCalledWith(index + 1, mp.invoiceLines, 'value')
      })
    })

    test('should not call getTotalValueInPence for empty mappedPaymentRequests', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(getTotalValueInPence).not.toBeCalled()
    })
  })

  describe('result validation', () => {
    const errorScenarios = [
      { desc: 'validation fails', message: 'Payment request content is invalid, Example error.' },
      { desc: 'invoice line invalid', message: 'Example error' },
      { desc: 'invoice line values mismatch', message: 'Invoice line values do not match header.' }
    ]

    test.each(errorScenarios)('should return unsuccessfulPaymentRequest when $desc', ({ message }) => {
    // Reset mocks for each scenario
      jest.clearAllMocks()

      if (message.includes('Example error') && message.includes('content')) {
        paymentRequestSchema.validate.mockReturnValue({ error: { message: 'Example error' } })
      } else if (message.includes('Example error')) {
        isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'Example error' })
      } else {
        convertToPence.mockReturnValue(getTotalValueInPence() + 1)
      }

      const unsuccessful = {
        ...unsuccessfulMappedPaymentRequest,
        errorMessage: `Payment request for FRN: ${unsuccessfulMappedPaymentRequest.frn} - ${unsuccessfulMappedPaymentRequest.invoiceNumber} from batch ${unsuccessfulMappedPaymentRequest.batch} is invalid, ${message} `
      }

      const result = filterPaymentRequest(paymentRequests, sourceSystem)

      expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)

      expect(result.unsuccessfulPaymentRequests.map(r => ({ ...r, errorMessage: r.errorMessage.trim() })))
        .toContainEqual({ ...unsuccessful, errorMessage: unsuccessful.errorMessage.trim() })
    })
  })
})
