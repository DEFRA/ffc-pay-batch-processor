const mockErrorMessages = require('../../../mocks/error-messages')

const filterPaymentRequest = require('../../../../app/processing/siti-agri/filter-payment-requests')

let paymentRequest
let paymentRequests

let mappedPaymentRequest

let sourceSystem

let paymentRequestCollection

describe('Filter payment requests', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequests))

    mappedPaymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').mappedPaymentRequest))

    sourceSystem = paymentRequest.sourceSystem

    paymentRequestCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should return mappedPaymentRequest as successfulPaymentRequests when valid payment request and sourceSystem are given', async () => {
    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.correlationId = result.successfulPaymentRequests[0].correlationId
    paymentRequestCollection.successfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when valid payment request and undefined sourceSystem are given', async () => {
    sourceSystem = undefined

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      sourceSystem: undefined,
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no invoiceNumber and sourceSystem are given', async () => {
    delete paymentRequest.invoiceNumber
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.invoiceNumber
    mappedPaymentRequest.correlationId = result.unsuccessfulPaymentRequests[0].correlationId
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no contractNumber and sourceSystem are given', async () => {
    delete paymentRequest.contractNumber
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.contractNumber
    mappedPaymentRequest.correlationId = result.unsuccessfulPaymentRequests[0].correlationId
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has no value and sourceSystem are given', async () => {
    delete paymentRequest.value
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.value
    mappedPaymentRequest.correlationId = result.unsuccessfulPaymentRequests[0].correlationId
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid frn and sourceSystem are given', async () => {
    paymentRequest.frn = 1
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      frn: 1,
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid marketingYear and sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].marketingYear = 2014
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      marketingYear: 2014,
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid currency and sourceSystem are given', async () => {
    paymentRequest.currency = 'USD'
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      currency: 'USD',
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid schedule and sourceSystem are given', async () => {
    paymentRequest.schedule = '4'
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      schedule: '4',
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid dueDate and sourceSystem are given', async () => {
    paymentRequest.invoiceLines[0].dueDate = '01/11/2022'
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      dueDate: '01/11/2022',
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return mappedPaymentRequest as unsuccessfulPaymentRequests when payment request has an invalid empty invoiceLines and sourceSystem are given', async () => {
    paymentRequest.invoiceLines = []
    paymentRequests = [paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId,
      invoiceLines: [],
      agreementNumber: undefined,
      dueDate: undefined,
      marketingYear: undefined
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(mappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return both mappedPaymentRequests as successfulPaymentRequests when 2 valid payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    const firstMappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result.successfulPaymentRequests[0].correlationId
    }
    const secondMappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result.successfulPaymentRequests[1].correlationId
    }
    paymentRequestCollection.successfulPaymentRequests.push(firstMappedPaymentRequest, secondMappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return both mappedPaymentRequests as unsuccessfulPaymentRequests when 2 invalid payment requests and sourceSystem are given', async () => {
    delete paymentRequest.paymentRequestNumber
    paymentRequests = [paymentRequest, paymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    delete mappedPaymentRequest.paymentRequestNumber
    const firstMappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result.unsuccessfulPaymentRequests[0].correlationId
    }
    const secondMappedPaymentRequest = {
      ...mappedPaymentRequest,
      correlationId: result.unsuccessfulPaymentRequests[1].correlationId
    }
    paymentRequestCollection.unsuccessfulPaymentRequests.push(firstMappedPaymentRequest, secondMappedPaymentRequest)
    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return 1 mappedPaymentRequests as successfulPaymentRequest and 1 mappedPaymentRequests as unsuccessfulPaymentRequest when first payment request is valid and second is invalid and sourceSystem are given', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    delete invalidPaymentRequest.paymentRequestNumber
    paymentRequests = [paymentRequest, invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)

    mappedPaymentRequest.correlationId = result.successfulPaymentRequests[0].correlationId

    const invalidMappedPaymentRequest = JSON.parse(JSON.stringify(mappedPaymentRequest))
    delete invalidMappedPaymentRequest.paymentRequestNumber
    invalidMappedPaymentRequest.correlationId = result.unsuccessfulPaymentRequests[0].correlationId

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
    invalidMappedPaymentRequest.correlationId = result.unsuccessfulPaymentRequests[0].correlationId

    mappedPaymentRequest.correlationId = result.successfulPaymentRequests[0].correlationId

    paymentRequestCollection.unsuccessfulPaymentRequests.push(invalidMappedPaymentRequest)
    paymentRequestCollection.successfulPaymentRequests.push(mappedPaymentRequest)

    expect(result).toMatchObject(paymentRequestCollection)
  })

  test('should return a concatenated errorMessage of all mockErrorMessages when validation is false for isPaymentRequestValid, validateLineTotals and isInvoiceLineValid', async () => {
    // alter this format for other variations, 1 validation fail vs 2 or 3. When multiple invoice lines fail.
    // should this be moved to top of file with a value for isInvoiceLineValid?

    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.value = 99
    delete invalidPaymentRequest.frn
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.isPaymentRequestValid and mockErrorMessages.validateLineTotals when validation is false for isPaymentRequestValid and validateLineTotals', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.value = 99
    delete invalidPaymentRequest.frn
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.validateLineTotals} `)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.isPaymentRequestValid and mockErrorMessages.isInvoiceLineValid when validation is false for isPaymentRequestValid and isInvoiceLineValid', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    delete invalidPaymentRequest.frn
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.validateLineTotals and mockErrorMessages.isInvoiceLineValid when validation is false for isPaymentRequestValid and isInvoiceLineValid', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.value = 99
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of two mockErrorMessages.isInvoiceLineValid when there are two invoice lines and validation is false for both invoice lines', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.invoiceLines.push(invalidPaymentRequest.invoiceLines[0])
    invalidPaymentRequest.value = 200
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    delete invalidPaymentRequest.invoiceLines[1].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isInvoiceLineValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a single errorMessage of mockErrorMessages.isInvoiceLineValid when there are two invoice lines and validation is false for one invoice line and true for other invoice line.', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    const validInvoiceLine = paymentRequest.invoiceLines[0]
    invalidPaymentRequest.invoiceLines.push(validInvoiceLine)
    invalidPaymentRequest.value = 200
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.validateLineTotals and two mockErrorMessages.isInvoiceLineValid when validation is false for both invoice lines and validateLineTotals is false', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.invoiceLines.push(invalidPaymentRequest.invoiceLines[0])
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    delete invalidPaymentRequest.invoiceLines[1].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.validateLineTotals and one mockErrorMessages.isInvoiceLineValid when validation is false for one invoice lines and validateLineTotals is false', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    const validInvoiceLine = paymentRequest.invoiceLines[0]
    invalidPaymentRequest.invoiceLines.push(validInvoiceLine)
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.isPaymentRequestValid and two mockErrorMessages.isInvoiceLineValid when validation is false for both invoice lines and isPaymentRequestValid is false', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.invoiceLines.push(invalidPaymentRequest.invoiceLines[0])
    invalidPaymentRequest.value = 200
    delete invalidPaymentRequest.frn
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    delete invalidPaymentRequest.invoiceLines[1].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.isInvoiceLineValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.isPaymentRequestValid and one mockErrorMessages.isInvoiceLineValid when validation is false for one invoice line and isPaymentRequestValid is false', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    const validInvoiceLine = paymentRequest.invoiceLines[0]
    invalidPaymentRequest.value = 200
    delete invalidPaymentRequest.frn
    invalidPaymentRequest.invoiceLines.push(validInvoiceLine)
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })

  test('should return a concatenated errorMessage of mockErrorMessages.isPaymentRequestValid, mockErrorMessages.validateLineTotals and two mockErrorMessages.isInvoiceLineValid when validation is false for all', async () => {
    const invalidPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
    invalidPaymentRequest.invoiceLines.push(invalidPaymentRequest.invoiceLines[0])
    delete invalidPaymentRequest.frn
    delete invalidPaymentRequest.invoiceLines[0].fundCode
    delete invalidPaymentRequest.invoiceLines[1].fundCode
    paymentRequests = [invalidPaymentRequest]

    const result = filterPaymentRequest(paymentRequests, sourceSystem)
    const resultErrorMessage = result.unsuccessfulPaymentRequests[0].errorMessage

    expect(resultErrorMessage).toContain(`${mockErrorMessages.isPaymentRequestValid} ${mockErrorMessages.validateLineTotals} ${mockErrorMessages.isInvoiceLineValid} ${mockErrorMessages.isInvoiceLineValid}`)
  })
})
