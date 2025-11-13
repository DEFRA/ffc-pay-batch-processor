const mockErrorMessages = require('../../../mocks/error-messages')
const filterPaymentRequest = require('../../../../app/processing/siti-agri/filter-payment-requests')

let paymentRequest
let paymentRequests
let mappedPaymentRequest
let sourceSystem
let paymentRequestCollection

describe('Filter payment requests', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../mocks/payment-request').paymentRequest)
    paymentRequests = structuredClone(require('../../../mocks/payment-request').paymentRequests)
    mappedPaymentRequest = structuredClone(require('../../../mocks/payment-request').mappedPaymentRequest)
    sourceSystem = paymentRequest.sourceSystem
    paymentRequestCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const singleValidationTests = [
    {
      name: 'returns successfulPaymentRequests when valid payment request and sourceSystem are given',
      mutate: () => {},
      expectedKey: 'successfulPaymentRequests'
    },
    {
      name: 'returns unsuccessfulPaymentRequests when valid payment request and undefined sourceSystem are given',
      mutate: () => { sourceSystem = undefined },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: (req, mapped) => ({ ...mapped, sourceSystem: undefined })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when missing invoiceNumber',
      mutate: () => { delete paymentRequest.invoiceNumber; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: (req, mapped) => { delete mapped.invoiceNumber; return mapped }
    },
    {
      name: 'returns unsuccessfulPaymentRequests when missing contractNumber',
      mutate: () => { delete paymentRequest.contractNumber; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: (req, mapped) => { delete mapped.contractNumber; return mapped }
    },
    {
      name: 'returns unsuccessfulPaymentRequests when missing value',
      mutate: () => { delete paymentRequest.value; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: (req, mapped) => { delete mapped.value; return mapped }
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invalid frn',
      mutate: () => { paymentRequest.frn = 1; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({ ...mappedPaymentRequest, frn: 1 })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invalid marketingYear',
      mutate: () => { paymentRequest.invoiceLines[0].marketingYear = 2014; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({ ...mappedPaymentRequest, marketingYear: 2014 })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invalid currency',
      mutate: () => { paymentRequest.currency = 'USD'; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({ ...mappedPaymentRequest, currency: 'USD' })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invalid schedule',
      mutate: () => { paymentRequest.schedule = '4'; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({ ...mappedPaymentRequest, schedule: '4' })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invalid dueDate',
      mutate: () => { paymentRequest.invoiceLines[0].dueDate = '01/11/2022'; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({ ...mappedPaymentRequest, dueDate: '01/11/2022' })
    },
    {
      name: 'returns unsuccessfulPaymentRequests when invoiceLines is empty',
      mutate: () => { paymentRequest.invoiceLines = []; paymentRequests = [paymentRequest] },
      expectedKey: 'unsuccessfulPaymentRequests',
      override: () => ({
        ...mappedPaymentRequest,
        invoiceLines: [],
        agreementNumber: undefined,
        dueDate: undefined,
        marketingYear: undefined
      })
    }
  ]

  singleValidationTests.forEach(({ name, mutate, expectedKey, override }) => {
    test(name, async () => {
      mutate()
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      const item = result[expectedKey][0]
      const expected = override ? override(paymentRequest, mappedPaymentRequest) : mappedPaymentRequest
      expected.correlationId = item.correlationId
      paymentRequestCollection[expectedKey].push(expected)
      expect(result).toMatchObject(paymentRequestCollection)
    })
  })

  test('returns both successfulPaymentRequests when 2 valid payment requests', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    paymentRequestCollection.successfulPaymentRequests.push(
      { ...mappedPaymentRequest, correlationId: result.successfulPaymentRequests[0].correlationId },
      { ...mappedPaymentRequest, correlationId: result.successfulPaymentRequests[1].correlationId }
    )
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('returns both unsuccessfulPaymentRequests when 2 invalid payment requests', async () => {
    delete paymentRequest.paymentRequestNumber
    paymentRequests = [paymentRequest, paymentRequest]
    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    delete mappedPaymentRequest.paymentRequestNumber
    paymentRequestCollection.unsuccessfulPaymentRequests.push(
      { ...mappedPaymentRequest, correlationId: result.unsuccessfulPaymentRequests[0].correlationId },
      { ...mappedPaymentRequest, correlationId: result.unsuccessfulPaymentRequests[1].correlationId }
    )
    expect(result).toMatchObject(paymentRequestCollection)
  })

  const mixedCases = [
    {
      name: 'first valid, second invalid',
      validFirst: true
    },
    {
      name: 'first invalid, second valid',
      validFirst: false
    }
  ]

  mixedCases.forEach(({ name, validFirst }) => {
    test(`returns 1 success + 1 fail when ${name}`, async () => {
      const invalid = structuredClone(paymentRequest)
      delete invalid.paymentRequestNumber
      paymentRequests = validFirst ? [paymentRequest, invalid] : [invalid, paymentRequest]

      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      const success = result.successfulPaymentRequests[0]
      const fail = result.unsuccessfulPaymentRequests[0]

      const validMapped = { ...mappedPaymentRequest, correlationId: success?.correlationId }
      const invalidMapped = { ...mappedPaymentRequest }
      delete invalidMapped.paymentRequestNumber
      invalidMapped.correlationId = fail?.correlationId

      paymentRequestCollection.successfulPaymentRequests.push(validMapped)
      paymentRequestCollection.unsuccessfulPaymentRequests.push(invalidMapped)
      expect(result).toMatchObject(paymentRequestCollection)
    })
  })

  const errorConcatTests = [
    {
      name: 'all three validations fail',
      mutate: () => {
        const invalid = structuredClone(paymentRequest)
        invalid.value = 99
        delete invalid.frn
        delete invalid.invoiceLines[0].fundCode
        paymentRequests = [invalid]
      },
      expected: `${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid}`
    },
    {
      name: 'paymentRequestValid + validateLineTotals fail',
      mutate: () => {
        const invalid = structuredClone(paymentRequest)
        invalid.value = 99
        delete invalid.frn
        paymentRequests = [invalid]
      },
      expected: `${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.validateLineTotals}`
    },
    {
      name: 'paymentRequestValid + isInvoiceLineValid fail',
      mutate: () => {
        const invalid = structuredClone(paymentRequest)
        delete invalid.frn
        delete invalid.invoiceLines[0].fundCode
        paymentRequests = [invalid]
      },
      expected: `${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.isInvoiceLineValid}`
    },
    {
      name: 'validateLineTotals + isInvoiceLineValid fail',
      mutate: () => {
        const invalid = structuredClone(paymentRequest)
        invalid.value = 99
        delete invalid.invoiceLines[0].fundCode
        paymentRequests = [invalid]
      },
      expected: `${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid}`
    }
  ]

  errorConcatTests.forEach(({ name, mutate, expected }) => {
    test(`returns concatenated errors when ${name}`, async () => {
      mutate()
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.unsuccessfulPaymentRequests[0].errorMessage).toContain(expected)
    })
  })

  const invoiceLineTests = [
    {
      name: 'two invalid invoice lines → 2x isInvoiceLineValid',
      setup: (req) => {
        req.invoiceLines.push(req.invoiceLines[0])
        req.value = 200
        delete req.invoiceLines[0].fundCode
        delete req.invoiceLines[1].fundCode
      },
      expected: `${mockErrorMessages.isInvoiceLineValid} ${mockErrorMessages.isInvoiceLineValid}`
    },
    {
      name: 'one invalid invoice line → 1x isInvoiceLineValid',
      setup: (req) => {
        const validLine = req.invoiceLines[0]
        req.invoiceLines.push(validLine)
        req.value = 200
        delete req.invoiceLines[0].fundCode
      },
      expected: `${mockErrorMessages.isInvoiceLineValid}`
    }
  ]

  invoiceLineTests.forEach(({ name, setup, expected }) => {
    test(name, async () => {
      const invalid = structuredClone(paymentRequest)
      setup(invalid)
      paymentRequests = [invalid]
      const result = filterPaymentRequest(paymentRequests, sourceSystem)
      expect(result.unsuccessfulPaymentRequests[0].errorMessage).toContain(expected)
    })
  })
})
