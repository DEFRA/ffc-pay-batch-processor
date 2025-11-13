const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

let paymentRequest
let paymentRequests
let mappedPaymentRequest
let invoiceLines
let mappedInvoiceLines
let sourceSystem

describe('Build mappedPaymentRequests', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../mocks/payment-request').paymentRequest)
    paymentRequests = structuredClone(require('../../../mocks/payment-request').paymentRequests)

    mappedPaymentRequest = structuredClone(require('../../../mocks/payment-request').mappedPaymentRequest)

    invoiceLines = structuredClone(require('../../../mocks/invoice-lines').invoiceLines)
    mappedInvoiceLines = structuredClone(require('../../../mocks/invoice-lines').mappedInvoiceLines)

    sourceSystem = paymentRequest.sourceSystem
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const setCorrelationId = (result, request = mappedPaymentRequest) => ({
    ...request,
    correlationId: result[0].correlationId
  })

  test('returns mappedPaymentRequests with valid paymentRequests and sourceSystem', () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    const expected = [setCorrelationId(result)]
    expect(result).toMatchObject(expected)
  })

  test('returns mappedPaymentRequests with undefined sourceSystem', () => {
    sourceSystem = undefined
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    const expected = [setCorrelationId(result, { ...mappedPaymentRequest, sourceSystem: undefined })]
    expect(result).toMatchObject(expected)
  })

  test('returns empty array when no paymentRequests are given', () => {
    paymentRequests = []
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toStrictEqual([])
  })

  const propertyTests = [
    { prop: 'invoiceNumber', value: undefined },
    { prop: 'contractNumber', value: undefined },
    { prop: 'value', value: undefined },
    { prop: 'frn', value: 1 },
    { prop: 'currency', value: 'USD' },
    { prop: 'schedule', value: '4' }
  ]

  test.each(propertyTests)(
    'returns mappedPaymentRequests with %p set to %p',
    ({ prop, value }) => {
      paymentRequest[prop] = value
      paymentRequests = [paymentRequest]

      const result = buildPaymentRequests(paymentRequests, sourceSystem)
      const expected = [setCorrelationId(result, { ...mappedPaymentRequest, [prop]: value })]

      expect(result).toMatchObject(expected)
    }
  )

  const nestedPropertyTests = [
    { path: ['invoiceLines', 0, 'marketingYear'], value: 2014 },
    { path: ['invoiceLines', 0, 'dueDate'], value: '01/11/2022' }
  ]

  test.each(nestedPropertyTests)(
    'returns mappedPaymentRequests with nested property %p set to %p',
    ({ path, value }) => {
      let target = paymentRequest
      for (let i = 0; i < path.length - 1; i++) target = target[path[i]]
      target[path[path.length - 1]] = value

      paymentRequests = [paymentRequest]
      const result = buildPaymentRequests(paymentRequests, sourceSystem)
      const propName = path[path.length - 1]
      const expected = [setCorrelationId(result, { ...mappedPaymentRequest, [propName]: value })]

      expect(result).toMatchObject(expected)
    }
  )

  test('returns mappedPaymentRequests with empty invoiceLines and undefined agreementNumber, dueDate, marketingYear', () => {
    paymentRequest.invoiceLines = []
    paymentRequests = [paymentRequest]
    const expectedRequest = {
      ...mappedPaymentRequest,
      correlationId: undefined,
      invoiceLines: [],
      agreementNumber: undefined,
      dueDate: undefined,
      marketingYear: undefined
    }
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    const expected = [{ ...expectedRequest, correlationId: result[0].correlationId }]
    expect(result).toMatchObject(expected)
  })

  test('returns paymentRequests as-is when no invoiceLines exist', () => {
    delete paymentRequest.invoiceLines
    paymentRequests = [paymentRequest]
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toMatchObject(paymentRequests)
  })

  test('returns mappedDefunctParticipationDefectPaymentRequests for special schemeCode', () => {
    const participationInvoiceLines = [{ ...invoiceLines[0], schemeCode: '80009', description: 'G00 - Gross value of claim' }]
    const mappedParticipationInvoiceLines = [{ ...mappedInvoiceLines[0], schemeCode: '80009', description: 'G00 - Gross value of claim' }]

    const defunctPaymentRequest = { ...paymentRequest, invoiceLines: participationInvoiceLines }
    const defunctPaymentRequests = [defunctPaymentRequest]

    const mappedDefunctRequest = {
      ...defunctPaymentRequest,
      invoiceLines: [{ ...mappedParticipationInvoiceLines[0], value: 0 }],
      value: 0
    }

    const result = buildPaymentRequests(defunctPaymentRequests, sourceSystem)
    expect(result).toMatchObject([mappedDefunctRequest])
  })
})
