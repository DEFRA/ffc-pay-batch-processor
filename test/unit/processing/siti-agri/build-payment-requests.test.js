jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../../app/processing/siti-agri/handle-known-defects')
const handleKnownDefects = require('../../../../app/processing/siti-agri/handle-known-defects')

jest.mock('../../../../app/processing/siti-agri/build-invoice-lines')
const { buildInvoiceLines } = require('../../../../app/processing/siti-agri/build-invoice-lines')

const correlationId = require('../../../mocks/correlation-id')

const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

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
    handleKnownDefects.mockImplementation((x) => { return x })
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
    expect(buildInvoiceLines).toBeCalledWith(paymentRequest.schemeId, paymentRequest.invoiceLines, paymentRequest.contractNumber)
  })

  test('should call buildInvoiceLines twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)
    expect(buildInvoiceLines).toBeCalledTimes(2)
  })

  test('should call buildInvoiceLines with each paymentRequests.invoiceLines when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenNthCalledWith(1, paymentRequests[0].schemeId, paymentRequests[0].invoiceLines, paymentRequests[0].contractNumber)
    expect(buildInvoiceLines).toHaveBeenNthCalledWith(2, paymentRequests[1].schemeId, paymentRequests[1].invoiceLines, paymentRequests[1].contractNumber)
  })

  test('should not call buildInvoiceLines when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(buildInvoiceLines).not.toBeCalled()
  })

  test('should call handleKnownDefects when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalled()
  })

  test('should call handleKnownDefects once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalledTimes(1)
  })

  test('should call handleKnownDefects with mappedPaymentRequest when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalledWith(mappedPaymentRequest)
  })

  test('should call handleKnownDefects twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)

    expect(handleKnownDefects).toBeCalledTimes(2)
  })

  test('should call handleKnownDefects with each mappedPaymentRequests when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0])
    expect(handleKnownDefects).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1])
  })

  test('should not call handleKnownDefects when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(handleKnownDefects).not.toBeCalled()
  })

  test('should return mappedPaymentRequests when valid paymentRequests and sourceSystem are given', async () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(result).toMatchObject(mappedPaymentRequests)
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

    buildInvoiceLines.mockReturnValue(mappedParticipationInvoiceLines)
    handleKnownDefects.mockImplementation((x) => { x.value = 0; x.invoiceLines[0].value = 0; return x })

    const result = buildPaymentRequests(defunctParticipationDefectPaymentRequests, sourceSystem)

    expect(result).toMatchObject(mappedDefunctParticipationDefectPaymentRequests)
  })
})
