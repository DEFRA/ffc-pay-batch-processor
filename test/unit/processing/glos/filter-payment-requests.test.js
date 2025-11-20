jest.mock('../../../../app/processing/glos/schemas/payment-request')
const paymentRequestSchema = require('../../../../app/processing/glos/schemas/payment-request')

jest.mock('../../../../app/processing/glos/build-payment-requests')
const buildPaymentRequests = require('../../../../app/processing/glos/build-payment-requests')

jest.mock('../../../../app/processing/glos/build-invoice-lines')
const { isInvoiceLineValid } = require('../../../../app/processing/glos/build-invoice-lines')

const filterPaymentRequest = require('../../../../app/processing/glos/filter-payment-requests')

let paymentRequest
let paymentRequests
let mappedPaymentRequest
let unsuccessfulMappedPaymentRequest
let mappedPaymentRequests
let mappedInvoiceLines
let sourceSystem

describe('filterPaymentRequests', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../mocks/payment-request-glos').paymentRequest)
    paymentRequests = structuredClone(require('../../../mocks/payment-request-glos').paymentRequests)

    mappedPaymentRequest = structuredClone(require('../../../mocks/payment-request-glos').mappedPaymentRequest)
    unsuccessfulMappedPaymentRequest = structuredClone(require('../../../mocks/payment-request-glos').unsuccessfulMappedPaymentRequest)
    mappedPaymentRequests = structuredClone(require('../../../mocks/payment-request-glos').mappedPaymentRequests)

    mappedInvoiceLines = structuredClone(require('../../../mocks/invoice-lines-glos').mappedInvoiceLines)

    sourceSystem = paymentRequest.sourceSystem

    buildPaymentRequests.mockReturnValue(mappedPaymentRequests)
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest })
    isInvoiceLineValid.mockReturnValue(true)
  })

  afterEach(() => jest.resetAllMocks())

  describe('buildPaymentRequests', () => {
    test.each([
      { desc: 'valid paymentRequests', requests: () => paymentRequests },
      { desc: '2 paymentRequests', requests: () => [...paymentRequests, paymentRequest] },
      { desc: 'empty array', requests: () => [] }
    ])('calls buildPaymentRequests once with $desc', ({ requests }) => {
      const reqArray = requests()
      filterPaymentRequest(reqArray, sourceSystem)
      expect(buildPaymentRequests).toBeCalledTimes(1)
      expect(buildPaymentRequests).toHaveBeenCalledWith(reqArray, sourceSystem)
    })
  })

  describe('paymentRequestSchema.validate', () => {
    test('called correctly for each mappedPaymentRequest', () => {
      mappedPaymentRequests.push(mappedPaymentRequest)
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      mappedPaymentRequests.forEach((req, idx) => {
        expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(idx + 1, req, { abortEarly: false })
      })
    })

    test('not called when buildPaymentRequests returns empty array', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(paymentRequestSchema.validate).not.toBeCalled()
    })
  })

  describe('isInvoiceLineValid', () => {
    test('called for each invoice line', () => {
      mappedPaymentRequest.invoiceLines = [mappedInvoiceLines[0], mappedInvoiceLines[0]]
      mappedPaymentRequests = [mappedPaymentRequest]
      buildPaymentRequests.mockReturnValue(mappedPaymentRequests)

      filterPaymentRequest(paymentRequests, sourceSystem)

      expect(isInvoiceLineValid).toHaveBeenCalledTimes(2)
      mappedPaymentRequest.invoiceLines.forEach((line, idx) => {
        expect(isInvoiceLineValid).toHaveBeenNthCalledWith(idx + 1, line)
      })
    })

    test('not called when buildPaymentRequests returns empty array', () => {
      buildPaymentRequests.mockReturnValue([])
      filterPaymentRequest([], sourceSystem)
      expect(isInvoiceLineValid).not.toBeCalled()
    })
  })

  describe('filtering results', () => {
    test('successfulPaymentRequests contains mappedPaymentRequest when valid', () => {
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.successfulPaymentRequests).toContainEqual(mappedPaymentRequest)
      expect(result.unsuccessfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
    })

    test.each([
      {
        desc: 'validation fails',
        setup: () => {
          paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest, error: { message: 'Error' } })
          unsuccessfulMappedPaymentRequest.errorMessage =
          `Payment request for FRN: ${mappedPaymentRequest.frn} - ${mappedPaymentRequest.invoiceNumber} from batch ${mappedPaymentRequest.batch} is invalid, Payment request content is invalid, Error. `
        }
      },
      {
        desc: 'invoice line invalid',
        setup: () => {
          isInvoiceLineValid.mockReturnValue({ result: false, errorMessage: 'Error' })
          unsuccessfulMappedPaymentRequest.errorMessage =
          `Payment request for FRN: ${mappedPaymentRequest.frn} - ${mappedPaymentRequest.invoiceNumber} from batch ${mappedPaymentRequest.batch} is invalid, Error`
        }
      }
    ])('unsuccessfulPaymentRequests contains mappedPaymentRequest when $desc', ({ setup }) => {
      setup()
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.successfulPaymentRequests).not.toContainEqual(mappedPaymentRequest)
      expect(result.unsuccessfulPaymentRequests).toContainEqual(unsuccessfulMappedPaymentRequest)
    })
  })
})
