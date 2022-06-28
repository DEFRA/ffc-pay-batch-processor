jest.mock('../../../app/event')
const { sendBatchProcessedEvents } = require('../../../app/event')

jest.mock('../../../app/messaging')
const { sendPaymentBatchMessage } = require('../../../app/messaging')

jest.mock('../../../app/processing/get-payment-requests-from-file')
const getPaymentRequestsFromFile = require('../../../app/processing/get-payment-requests-from-file')

const parsePaymentFile = require('../../../app/processing/parse-payment-file')
const { sfiPilot } = require('../../../app/schemes')

let sequence
let filename
let fileBuffer

let mockPaymentRequests

describe('Parse and send events on success or failure', () => {
  beforeEach(async () => {
    sequence = 1
    filename = 'SITIELM0001_AP_20210812105407541.dat'
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    mockPaymentRequests = [{
      paymentRequestId: 1
    }]

    getPaymentRequestsFromFile.mockResolvedValue({
      paymentRequests: mockPaymentRequests,
      batchExportDate: '2021-08-12'
    })
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call getPaymentRequestsFromFile when valid filename, fileBuffer scheme and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(getPaymentRequestsFromFile).toHaveBeenCalled()
  })

  test('should call getPaymentRequestsFromFile with fileBuffer and sequence when valid filename, fileBuffer scheme and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(getPaymentRequestsFromFile).toHaveBeenCalledWith(fileBuffer, sfiPilot)
  })

  test('should call getPaymentRequestsFromFile when invalid filename, fileBuffer and scheme sequence are received', async () => {
    filename = ''
    fileBuffer = ''

    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(getPaymentRequestsFromFile).toHaveBeenCalled()
  })

  test('should call getPaymentRequestsFromFile with fileBuffer and sequence when invalid filename, fileBuffer scheme and sequence are received', async () => {
    filename = ''
    fileBuffer = ''
    sequence = ''

    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(getPaymentRequestsFromFile).toHaveBeenCalledWith(fileBuffer, sfiPilot)
  })

  test('should call sendBatchProcessedEvents when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(sendBatchProcessedEvents).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvents with filename, paymentRequests sequence and batch export date when valid filename, fileBuffer scheme and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(sendBatchProcessedEvents).toHaveBeenCalledWith(filename, mockPaymentRequests, sequence, '2021-08-12')
  })

  test('should call sendPaymentBatchMessage when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(sendPaymentBatchMessage).toHaveBeenCalled()
  })

  test('should call sendPaymentBatchMessage with paymentRequests when valid filename, fileBuffer and sequence are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(sendPaymentBatchMessage).toHaveBeenCalledWith(mockPaymentRequests)
  })

  test('should return true when valid filename, fileBuffer and sequence are received', async () => {
    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(result).toBe(true)
  })

  test('should return false when getPaymentRequestsFromFile rejects', async () => {
    getPaymentRequestsFromFile.mockRejectedValue(new Error('Invalid file - Unknown line'))

    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot, sequence)
    expect(result).toBe(false)
  })
})
