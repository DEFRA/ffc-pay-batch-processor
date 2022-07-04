const { GBP } = require('../../app/currency')
const { Q4 } = require('../../app/schedules')
const { sfiPilot } = require('../../app/schemes')

const buildPaymentRequests = require('../../app/processing/siti-agri/build-payment-requests')

describe('Build mappedPaymentRequests', () => {
  let sourceSystem

  let invoiceLines
  let mappedInvoiceLines

  let paymentRequest
  let paymentRequests

  let mappedPaymentRequest
  let mappedPaymentRequests

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
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should return mappedPaymentRequests when valid paymentRequests and sourceSystem are given', async () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with undefined sourceSystem when valid paymentRequests and undefined sourceSystem are given', async () => {
    sourceSystem = undefined

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.sourceSystem = sourceSystem
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return empty array when no paymentRequests and valid sourceSystem are given', async () => {
    paymentRequests = []
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toStrictEqual([])
  })

  test('should return mappedPaymentRequests with no invoiceNumber when paymentRequests with no invoiceNumber and valid sourceSystem are given', async () => {
    delete paymentRequest.invoiceNumber

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.invoiceNumber
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with no contractNumber when paymentRequests with no contractNumber and valid sourceSystem are given', async () => {
    delete paymentRequest.contractNumber

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.contractNumber
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with no value when paymentRequests with no value and valid sourceSystem are given', async () => {
    delete paymentRequest.value

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.value
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid frn when paymentRequests with an invalid frn and valid sourceSystem are given', async () => {
    paymentRequest.frn = 1

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.frn = 1
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid marketingYear when paymentRequests with an invalid marketingYear and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].marketingYear = 2014

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.marketingYear = 2014
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid currency when paymentRequests with an invalid currency and valid sourceSystem are given', async () => {
    paymentRequest.currency = 'USD'

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.currency = 'USD'
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid schedule when paymentRequests with an invalid schedule and valid sourceSystem are given', async () => {
    paymentRequest.schedule = '4'

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.schedule = '4'
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid dueDate when paymentRequests with an invalid dueDate and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].dueDate = '01/11/2022'

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.dueDate = '01/11/2022'
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an empty array for invoiceLines and undefined agreeementNumber, dueDate and marketingYear when paymentRequests with an empty array for invoiceLines and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines = []

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.invoiceLines = []
    mappedPaymentRequest.agreementNumber = undefined
    mappedPaymentRequest.dueDate = undefined
    mappedPaymentRequest.marketingYear = undefined
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return an empty array when paymentRequests with no invoiceLines and valid sourceSystem are given', async () => {
    delete paymentRequest.invoiceLines
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toMatchObject([])
  })

  test('should return mappedDefunctParticipationDefectPaymentRequests when defunctParticipationDefectPaymentRequest and sourceSystem are given', async () => {
    const participationInvoiceLines = [{
      ...invoiceLines[0],
      schemeCode: '80009',
      description: 'G00 - Gross value of claim'
    }]

    const mappedParticipationInvoiceLines = [{
      ...mappedInvoiceLines[0],
      schemeCode: '80009',
      description: 'G00 - Gross value of claim'
    }]

    const defunctParticipationDefectPaymentRequest = {
      ...paymentRequest,
      invoiceLines: participationInvoiceLines
    }

    const defunctParticipationDefectPaymentRequests = [defunctParticipationDefectPaymentRequest]

    const mappedDefunctParticipationDefectPaymentRequest = {
      ...defunctParticipationDefectPaymentRequest,
      invoiceLines: [{
        ...mappedParticipationInvoiceLines[0],
        value: 0
      }]
    }

    const mappedDefunctParticipationDefectPaymentRequests = [{
      ...mappedDefunctParticipationDefectPaymentRequest,
      value: 0
    }]

    const result = buildPaymentRequests(defunctParticipationDefectPaymentRequests, sourceSystem)

    expect(result).toMatchObject(mappedDefunctParticipationDefectPaymentRequests)
  })
})
