jest.mock('node:crypto')
const { randomUUID } = require('node:crypto')

jest.mock('../../../../app/processing/siti-agri/handle-known-defects')
const handleKnownDefects = require('../../../../app/processing/siti-agri/handle-known-defects')

jest.mock('../../../../app/processing/siti-agri/build-invoice-lines')
const { buildInvoiceLines } = require('../../../../app/processing/siti-agri/build-invoice-lines')

const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')

const correlationId = require('../../../mocks/correlation-id')

const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

const { CS, SFI_EXPANDED, COHT_REVENUE } = getSchemeIds()
const {
  CS: CS_SOURCE_SYSTEM,
  SFI_EXPANDED: SFI_EXPANDED_SOURCE_SYSTEM,
  COHT_REVENUE: COHT_REVENUE_SOURCE_SYSTEM
} = getSourceSystems()

const cs = {
  schemeId: CS,
  sourceSystem: CS_SOURCE_SYSTEM
}

const sfiExpanded = {
  schemeId: SFI_EXPANDED,
  sourceSystem: SFI_EXPANDED_SOURCE_SYSTEM
}

const cohtRevenue = {
  schemeId: COHT_REVENUE,
  sourceSystem: COHT_REVENUE_SOURCE_SYSTEM
}

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

    randomUUID.mockReturnValue(correlationId)
    buildInvoiceLines.mockReturnValue(mappedInvoiceLines)
    handleKnownDefects.mockImplementation(x => x)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should return [] when paymentRequests is undefined', () => {
    const result = buildPaymentRequests(undefined, sourceSystem)

    expect(result).toMatchObject([])
  })

  test('should call randomUUID when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(randomUUID).toHaveBeenCalled()
  })

  test('should call randomUUID once when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  test('should call randomUUID twice when paymentRequests has 2 payment requests and sourceSystem are given', () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(randomUUID).toHaveBeenCalledTimes(2)
  })

  test('should not call randomUUID when an empty paymentRequests array and valid sourceSystem are given', () => {
    buildPaymentRequests([], sourceSystem)

    expect(randomUUID).not.toHaveBeenCalled()
  })

  test('should call buildInvoiceLines when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenCalled()
  })

  test('should call buildInvoiceLines once when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenCalledTimes(1)
  })

  test('should call buildInvoiceLines with paymentRequest.invoiceLines when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenCalledWith(paymentRequest)
  })

  test('should call buildInvoiceLines twice when paymentRequests has 2 payment requests and sourceSystem are given', () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenCalledTimes(2)
  })

  test('should call buildInvoiceLines with each paymentRequests.invoiceLines when paymentRequests has 2 payment requests', () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(buildInvoiceLines).toHaveBeenNthCalledWith(1, paymentRequests[0])
    expect(buildInvoiceLines).toHaveBeenNthCalledWith(2, paymentRequests[1])
  })

  test('should not call buildInvoiceLines when an empty paymentRequests array and valid sourceSystem are given', () => {
    buildPaymentRequests([], sourceSystem)

    expect(buildInvoiceLines).not.toHaveBeenCalled()
  })

  test('should call handleKnownDefects when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenCalled()
  })

  test('should call handleKnownDefects once when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenCalledTimes(1)
  })

  test('should call handleKnownDefects with mappedPaymentRequest when valid paymentRequests and sourceSystem are given', () => {
    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenCalledWith(mappedPaymentRequest)
  })

  test('should call handleKnownDefects twice when paymentRequests has 2 payment requests', () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenCalledTimes(2)
  })

  test('should call handleKnownDefects with each mapped payment request', () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0])
    expect(handleKnownDefects).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1])
  })

  test('should not call handleKnownDefects when an empty paymentRequests array and valid sourceSystem are given', () => {
    buildPaymentRequests([], sourceSystem)

    expect(handleKnownDefects).not.toHaveBeenCalled()
  })

  test('should return mappedPaymentRequests when valid paymentRequests and sourceSystem are given', () => {
    const result = buildPaymentRequests(paymentRequests, sourceSystem)

    expect(result).toMatchObject(mappedPaymentRequests)
  })

  test('should overwrite delivery body to that present in invoice lines if CS', () => {
    paymentRequest.schemeId = cs.schemeId
    paymentRequest.invoiceLines[0].deliveryBody = 'DB99'

    const result = buildPaymentRequests([paymentRequest], cs.sourceSystem)

    expect(result[0].deliveryBody).toBe('DB99')
  })

  test('should not overwrite delivery body to that present in invoice lines if not CS', () => {
    paymentRequest.invoiceLines[0].deliveryBody = 'DB99'

    const result = buildPaymentRequests([paymentRequest], sourceSystem)

    expect(result[0].deliveryBody).toBe(paymentRequest.deliveryBody)
  })

  describe('Source system logic in payment requests', () => {
    test('should use provided source system when not sfi expanded', () => {
      paymentRequest.schemeId = cs.schemeId

      const result = buildPaymentRequests([paymentRequest], cs.sourceSystem)

      expect(result[0].sourceSystem).toBe(cs.sourceSystem)
    })

    test('should use COHT Revenue source system for the COHT Revenue scheme', () => {
      paymentRequest.schemeId = cohtRevenue.schemeId

      const result = buildPaymentRequests(
        [paymentRequest],
        sfiExpanded.sourceSystem
      )

      expect(result[0].sourceSystem).toBe(cohtRevenue.sourceSystem)
    })

    test('should use SFI Expanded source system otherwise for SFI expanded scheme', () => {
      paymentRequest.schemeId = sfiExpanded.schemeId

      const result = buildPaymentRequests(
        [paymentRequest],
        sfiExpanded.sourceSystem
      )

      expect(result[0].sourceSystem).toBe(sfiExpanded.sourceSystem)
    })
  })

  test('should return mapped defunct participation defect payment requests', () => {
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

    const mappedDefunctParticipationDefectPaymentRequests = [{
      ...defunctParticipationDefectPaymentRequest,
      value: 0,
      invoiceLines: [{
        ...mappedParticipationInvoiceLines[0],
        value: 0
      }]
    }]

    buildInvoiceLines.mockReturnValue(mappedParticipationInvoiceLines)
    handleKnownDefects.mockImplementation(x => {
      x.value = 0
      x.invoiceLines[0].value = 0
      return x
    })

    const result = buildPaymentRequests(
      [defunctParticipationDefectPaymentRequest],
      sourceSystem
    )

    expect(result).toMatchObject(mappedDefunctParticipationDefectPaymentRequests)
  })
})
