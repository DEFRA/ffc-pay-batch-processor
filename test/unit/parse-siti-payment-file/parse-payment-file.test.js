jest.mock('../../../app/event')
const { sendBatchProcessedEvents, sendBatchErrorEvent } = require('../../../app/event')

jest.mock('../../../app/messaging')
const { sendPaymentBatchMessage } = require('../../../app/messaging')

jest.mock('../../../app/parse-siti-payment-file/build-payment-file')
const { buildAndTransformParseFile } = require('../../../app/processing/parsing/get-payment-requests')

const { parsePaymentFile } = require('../../../app/processing/parsing/parse-payment-file')
const { SFI_PILOT } = require('../../../app/schemes')

let filename
let fileBuffer
let schemeType

let mockPaymentRequests

describe('Parse and send events on success or failure', () => {
  beforeEach(async () => {
    filename = 'SITIELM0001_AP_20210812105407541.dat'
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')
    schemeType = {
      batchId: '0001',
      scheme: SFI_PILOT
    }

    buildAndTransformParseFile.mockResolvedValue({
      PaymentRequests: [{
        paymentRequestId: 1
      }],
      batchExportDate: '2021-08-12'
    })
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call buildAndTransformParseFile when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(buildAndTransformParseFile).toHaveBeenCalled()
  })

  test('should call buildAndTransformParseFile with fileBuffer and sequence when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(buildAndTransformParseFile).toHaveBeenCalledWith(fileBuffer, schemeType)
  })

  test('should call buildAndTransformParseFile when invalid filename, fileBuffer and sequence are received', async () => {
    filename = ''
    fileBuffer = ''
    schemeType = ''

    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(buildAndTransformParseFile).toHaveBeenCalled()
  })

  test('should call buildAndTransformParseFile with fileBuffer and sequence when invalid filename, fileBuffer and sequence are received', async () => {
    filename = ''
    fileBuffer = ''
    schemeType = ''

    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(buildAndTransformParseFile).toHaveBeenCalledWith(fileBuffer, schemeType)
  })

  test('should call sendBatchProcessedEvents when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendBatchProcessedEvents).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvents with filename, paymentRequests and sequence when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendBatchProcessedEvents).toHaveBeenCalledWith(filename, mockPaymentRequests, schemeType.batchId, '2021-08-12')
  })

  test('should call sendPaymentBatchMessage when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendPaymentBatchMessage).toHaveBeenCalled()
  })

  test('should call sendPaymentBatchMessage with paymentRequests when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendPaymentBatchMessage).toHaveBeenCalledWith(mockPaymentRequests)
  })

  test('should return true when valid filename, fileBuffer and sequence are received', async () => {
    const result = await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(result).toBe(true)
  })

  test('should call sendBatchErrorEvent when buildAndTransformParseFile rejects', async () => {
    buildAndTransformParseFile.mockRejectedValue(new Error('Invalid file - Unknown line'))

    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendBatchErrorEvent).toHaveBeenCalled()
  })

  test('should call sendBatchErrorEvent with filename and reject error when buildAndTransformParseFile rejects', async () => {
    buildAndTransformParseFile.mockRejectedValue(new Error('Invalid file - Unknown line'))

    filename = 'notAFormattedFileName.dat'

    await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(sendBatchErrorEvent).toHaveBeenCalledWith(filename, new Error('Invalid file - Unknown line'))
  })

  test('should return false when buildAndTransformParseFile rejects', async () => {
    buildAndTransformParseFile.mockRejectedValue(new Error('Invalid file - Unknown line'))

    const result = await parsePaymentFile(filename, fileBuffer, schemeType)
    expect(result).toBe(false)
  })
})
