jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/processing/siti-agri/filter-payment-requests')
const filterPaymentRequests = require('../../../app/processing/siti-agri/filter-payment-requests')

jest.mock('../../../app/processing/siti-agri/validate-batch')
const validateBatch = require('../../../app/processing/siti-agri/validate-batch')

const mockCorrelationId = require('../../mocks/correlation-id')
const mockFileName = require('../../mocks/filename')

const { lumpSums, sfiPilot, sfi } = require('../../../app/constants/schemes')
const { M12 } = require('../../../app/constants/schedule')
const { GBP } = require('../../../app/constants/currency')
const { AP } = require('../../../app/constants/ledger')

const getPaymentRequestsFromFile = require('../../../app/processing/get-payment-requests-from-file')

let filename
let fileBuffer

let batchHeaders
let batchPaymentRequestsSFIPilot
let batchPaymentRequestsLumpSums

describe('getPaymentRequestsFromFile', () => {
  beforeEach(async () => {
    uuidv4.mockReturnValue(mockCorrelationId)

    filename = mockFileName
    fileBuffer = Buffer.from(
      'B^2021-08-12^2^200^0001^SFIP^AP\r\n' +
      'H^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\n' +
      'L^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\n' +
      'H^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\n' +
      'L^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n'
    )

    batchHeaders = [{
      batchValue: 200,
      exportDate: '2021-08-12',
      ledger: AP,
      numberOfPaymentRequests: 2,
      sequence: 1,
      sourceSystem: 'SFIP'
    }]

    batchPaymentRequestsSFIPilot = [
      {
        batch: filename,
        contractNumber: 'SFIP000001',
        correlationId: mockCorrelationId,
        currency: GBP,
        deliveryBody: 'RP00',
        frn: '1000000001',
        invoiceNumber: 'SFI00000001',
        paymentRequestNumber: 1,
        schedule: M12,
        schemeId: sfiPilot.schemeId,
        value: 100,
        invoiceLines: [{
          accountCode: 'SOS27',
          agreementNumber: 'SIP00000000001',
          deliveryBody: 'RP00',
          description: 'G00 - Gross value of claim',
          dueDate: '2022-12-01',
          fundCode: 'DRD10',
          invoiceNumber: 'SFI00000001',
          marketingYear: 2022,
          schemeCode: '80001',
          value: 100
        }]
      },
      {
        batch: filename,
        contractNumber: 'SFIP000002',
        correlationId: mockCorrelationId,
        currency: GBP,
        deliveryBody: 'RP00',
        frn: '1000000002',
        invoiceNumber: 'SFI00000002',
        paymentRequestNumber: 3,
        schedule: M12,
        schemeId: sfiPilot.schemeId,
        value: 100,
        invoiceLines: [{
          accountCode: 'SOS273',
          agreementNumber: 'SIP00000000002',
          deliveryBody: 'RP00',
          description: 'G00 - Gross value of claim',
          dueDate: '2022-12-01',
          fundCode: 'DRD10',
          invoiceNumber: 'SFI00000002',
          marketingYear: 2022,
          schemeCode: '80001',
          value: 100
        }]
      }
    ]

    batchPaymentRequestsLumpSums = [
      {
        batch: filename,
        contractNumber: 'L0000001',
        correlationId: mockCorrelationId,
        currency: GBP,
        deliveryBody: 'RP00',
        frn: '1000000001',
        invoiceNumber: 'LSES0000001',
        paymentRequestNumber: 1,
        schemeId: lumpSums.schemeId,
        value: 100,
        invoiceLines: [{
          deliveryBody: 'RP00',
          description: 'G00 - Gross value of claim',
          dueDate: '2022-12-01',
          fundCode: 'DOM10',
          invoiceNumber: 'LSES0000001',
          marketingYear: 2022,
          schemeCode: '10570',
          value: 100
        }]
      },
      {
        batch: filename,
        contractNumber: 'L0000002',
        correlationId: mockCorrelationId,
        currency: GBP,
        deliveryBody: 'RP00',
        frn: '1000000002',
        invoiceNumber: 'LSES0000002',
        paymentRequestNumber: 2,
        schemeId: lumpSums.schemeId,
        value: 100,
        invoiceLines: [{
          deliveryBody: 'RP00',
          description: 'G00 - Gross value of claim',
          dueDate: '2022-12-01',
          fundCode: 'DOM10',
          invoiceNumber: 'LSES0000002',
          marketingYear: 2022,
          schemeCode: '10570',
          value: 100
        }]
      }
    ]

    validateBatch.mockReturnValue(true)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call validateBatch when valid fileBuffer and scheme are received', async () => {
    await getPaymentRequestsFromFile(fileBuffer, sfiPilot, filename)
    expect(validateBatch).toHaveBeenCalled()
  })

  test('should call validateBatch with batchHeaders and payment requests when valid fileBuffer and scheme are received', async () => {
    await getPaymentRequestsFromFile(fileBuffer, sfiPilot, filename)
    expect(validateBatch).toHaveBeenCalledWith(batchHeaders, batchPaymentRequestsSFIPilot)
  })

  test('should call filterPaymentRequests when valid fileBuffer and scheme are received', async () => {
    await getPaymentRequestsFromFile(fileBuffer, sfiPilot, filename)
    expect(filterPaymentRequests).toHaveBeenCalled()
  })

  test.each([
    ['SFI Pilot', sfiPilot.sourceSystem],
    ['SFI', sfi.sourceSystem]
  ])('should call filterPaymentRequests with %s batchPaymentRequests and source system', async (_, sourceSystem) => {
    await getPaymentRequestsFromFile(fileBuffer, _ === 'SFI Pilot' ? sfiPilot : sfi, filename)

    expect(filterPaymentRequests).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          correlationId: mockCorrelationId,
          currency: GBP,
          deliveryBody: 'RP00',
          schedule: M12
        })
      ]),
      sourceSystem
    )
  })

  test('should call filterPaymentRequests with Lump Sums batchPaymentRequests and source system', async () => {
    fileBuffer = Buffer.from(
      'B^2021-08-12^2^200^0001^LSES^AP\r\n' +
      'H^LSES0000001^001^L0000001^1000000001^1^100^RP00^GBP\r\n' +
      'L^LSES0000001^100^2022^10570^DOM10^RP00^1^G00 - Gross value of claim^2022-12-01\r\n' +
      'H^LSES0000002^002^L0000002^1000000002^1^100^RP00^GBP\r\n' +
      'L^LSES0000002^100^2022^10570^DOM10^RP00^1^G00 - Gross value of claim^2022-12-01\r\n'
    )
    await getPaymentRequestsFromFile(fileBuffer, lumpSums, filename)
    expect(filterPaymentRequests).toHaveBeenCalledWith(batchPaymentRequestsLumpSums, lumpSums.sourceSystem)
  })

  test.each([
    ['rejects when line starts with invalid character', 'V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\n', Error, 'Invalid file'],
    ['rejects when validateBatch returns false', null, Error, 'Invalid file']
  ])('%s', async (_, bufferOverride, ErrorClass, errorMessage) => {
    if (bufferOverride) fileBuffer = Buffer.from(bufferOverride)
    else validateBatch.mockReturnValue(false)

    const wrapper = async () => {
      await getPaymentRequestsFromFile(fileBuffer, sfiPilot, filename)
    }

    await expect(wrapper).rejects.toThrowError(ErrorClass)
    if (errorMessage) {
      await expect(wrapper).rejects.toThrowError(errorMessage)
    }
  })

  test('should not call filterPaymentRequests when validateBatch returns false', async () => {
    validateBatch.mockReturnValue(false)
    try {
      await getPaymentRequestsFromFile(fileBuffer, sfiPilot, filename)
    } catch (err) { }

    expect(filterPaymentRequests).not.toHaveBeenCalled()
  })
})
