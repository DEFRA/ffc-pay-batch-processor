const { GBP } = require('../../app/currency')
const { Q4 } = require('../../app/schedules')
const { sfiPilot } = require('../../app/schemes')

const filterPaymentRequest = require('../../app/processing/siti-agri/filter-payment-requests')

describe('Filter payment requests', () => {
  let sourceSystem

  let invoiceLines
  let mappedInvoiceLines

  let paymentRequest
  let paymentRequests

  let mappedPaymentRequest
  let mappedPaymentRequests

  let paymentRequestCollection

  beforeEach(() => {
    sourceSystem = sfiPilot.sourceSystem

    mappedInvoiceLines = [{
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      description: 'G00 - Gross value of claim',
      value: 100
    }]

    invoiceLines = [{
      ...mappedInvoiceLines[0],
      marketingYear: 2022,
      dueDate: '2022-11-02',
      agreementNumber: 'SIP123456789012'
    }]

    paymentRequest = {
      sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100,
      deliveryBody: 'RP00',
      invoiceLines
    }

    paymentRequests = [paymentRequest]

    mappedPaymentRequest = {
      ...paymentRequest,
      invoiceLines: mappedInvoiceLines,
      marketingYear: invoiceLines[0].marketingYear,
      agreementNumber: invoiceLines[0].agreementNumber,
      dueDate: invoiceLines[0].dueDate
    }

    mappedPaymentRequests = [mappedPaymentRequest]

    paymentRequestCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should return mappedPaymentRequest as successfulPaymentRequests when valid payment request and sourceSystem are given', async () => {
    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    paymentRequestCollection.successfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when valid payment request and undefined sourceSystem are given', async () => {
    sourceSystem = undefined

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    paymentRequestCollection.unsuccessfulPaymentRequests.push({
      ...mappedPaymentRequest,
      sourceSystem
    })
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no invoiceNumber and sourceSystem are given', async () => {
    delete paymentRequest.invoiceNumber

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.invoiceNumber
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no contractNumber and sourceSystem are given', async () => {
    delete paymentRequest.contractNumber

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.contractNumber
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no value and sourceSystem are given', async () => {
    delete paymentRequest.value

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.value
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid frn and sourceSystem are given', async () => {
    paymentRequest.frn = 1

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.frn = 1
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid marketingYear and sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].marketingYear = 2014

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.marketingYear = 2014
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid currency and sourceSystem are given', async () => {
    paymentRequest.currency = 'USD'

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.currency = 'USD'
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid schedule and sourceSystem are given', async () => {
    paymentRequest.schedule = '4'

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.schedule = '4'
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid dueDate and sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].dueDate = '01/11/2022'

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.dueDate = '01/11/2022'
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return both mappedPaymentRequests as successfulPaymentRequests when 2 valid payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    mappedPaymentRequests.map(x => paymentRequestCollection.successfulPaymentRequests.push(x))
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return both mappedPaymentRequests as unsuccessfulPaymentRequests when 2 invalid payment requests and sourceSystem are given', async () => {
    delete paymentRequest.paymentRequestNumber
    paymentRequests = [paymentRequest, paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.paymentRequestNumber
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]
    mappedPaymentRequests.map(x => paymentRequestCollection.unsuccessfulPaymentRequests.push(x))
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return 1 mappedPaymentRequests as successfulPaymentRequest and 1 mappedPaymentRequests as unsuccessfulPaymentRequest when first payment request is valid and second is invalid and sourceSystem are given', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    delete invalidPaymentRequest.paymentRequestNumber
    paymentRequests = [paymentRequest, invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    const invalidMappedPaymentRequest = JSON.parse(JSON.stringify(mappedPaymentRequest))
    delete invalidMappedPaymentRequest.paymentRequestNumber
    mappedPaymentRequests = [mappedPaymentRequest, invalidMappedPaymentRequest]

    paymentRequestCollection.successfulPaymentRequests.push(mappedPaymentRequest)
    paymentRequestCollection.unsuccessfulPaymentRequests.push(invalidMappedPaymentRequest)

    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return 1 mappedPaymentRequests as successfulPaymentRequest and 1 mappedPaymentRequests as unsuccessfulPaymentRequest when first payment request is invalid and second is valid and sourceSystem are given', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    delete invalidPaymentRequest.paymentRequestNumber
    paymentRequests = [invalidPaymentRequest, paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    const invalidMappedPaymentRequest = JSON.parse(JSON.stringify(mappedPaymentRequest))
    delete invalidMappedPaymentRequest.paymentRequestNumber
    mappedPaymentRequests = [invalidMappedPaymentRequest, mappedPaymentRequest]

    paymentRequestCollection.successfulPaymentRequests.push(mappedPaymentRequest)
    paymentRequestCollection.unsuccessfulPaymentRequests.push(invalidMappedPaymentRequest)

    expect(result).toMatchObject(paymentRequestCollection)
  })
})
