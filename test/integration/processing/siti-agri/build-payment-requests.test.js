const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

let paymentRequest
let paymentRequests

let mappedPaymentRequest
let mappedPaymentRequests

let invoiceLines
let mappedInvoiceLines

let sourceSystem

describe('Build mappedPaymentRequests', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequests))

    mappedPaymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequest))
    mappedPaymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequests))

    invoiceLines = JSON.parse(JSON.stringify(require('../../../mocks/invoice-lines').invoiceLines))
    mappedInvoiceLines = JSON.parse(JSON.stringify(require('../../../mocks/invoice-lines').mappedInvoiceLines))

    sourceSystem = paymentRequest.sourceSystem
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should return mappedPaymentRequests when valid paymentRequests and sourceSystem are given', async () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest.correlationId = result[0].correlationId
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with undefined sourceSystem when valid paymentRequests and undefined sourceSystem are given', async () => {
    sourceSystem = undefined

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      sourceSystem: undefined,
      correlationId: result[0].correlationId
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return empty array when no paymentRequests and valid sourceSystem are given', async () => {
    paymentRequests = []
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toStrictEqual([])
  })

  test('should return mappedPaymentRequests with no invoiceNumber when paymentRequests with no invoiceNumber and valid sourceSystem are given', async () => {
    delete paymentRequest.invoiceNumber
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.invoiceNumber
    mappedPaymentRequest.correlationId = result[0].correlationId
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with no contractNumber when paymentRequests with no contractNumber and valid sourceSystem are given', async () => {
    delete paymentRequest.contractNumber
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.contractNumber
    mappedPaymentRequest.correlationId = result[0].correlationId
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with no value when paymentRequests with no value and valid sourceSystem are given', async () => {
    delete paymentRequest.value
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.value
    mappedPaymentRequest.correlationId = result[0].correlationId
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid frn when paymentRequests with an invalid frn and valid sourceSystem are given', async () => {
    paymentRequest.frn = 1
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      frn: 1
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid marketingYear when paymentRequests with an invalid marketingYear and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].marketingYear = 2014
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      marketingYear: 2014
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid currency when paymentRequests with an invalid currency and valid sourceSystem are given', async () => {
    paymentRequest.currency = 'USD'
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      currency: 'USD'
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid schedule when paymentRequests with an invalid schedule and valid sourceSystem are given', async () => {
    paymentRequest.schedule = '4'
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      schedule: '4'
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an invalid dueDate when paymentRequests with an invalid dueDate and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].dueDate = '01/11/2022'
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      dueDate: '01/11/2022'
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return mappedPaymentRequests with an empty array for invoiceLines and undefined agreementNumber, dueDate and marketingYear when paymentRequests with an empty array for invoiceLines and valid sourceSystem are given', async () => {
    paymentRequest.invoiceLines = []
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result[0].correlationId,
      invoiceLines: [],
      agreementNumber: undefined,
      dueDate: undefined,
      marketingYear: undefined
    }
    mappedPaymentRequests = [mappedPaymentRequest]
    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should return paymentRequests when paymentRequests with no invoiceLines and valid sourceSystem are given', async () => {
    delete paymentRequest.invoiceLines
    paymentRequests = [paymentRequest]

    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    expect(result).toMatchObject(paymentRequests)
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
