jest.mock('../../../app/event')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../../../app/event')

jest.mock('../../../app/messaging')
const { sendPaymentBatchMessages } = require('../../../app/messaging')

jest.mock('../../../app/processing/get-payment-requests-from-file')
const getPaymentRequestsFromFile = require('../../../app/processing/get-payment-requests-from-file')

const parsePaymentFile = require('../../../app/processing/parse-payment-file')
const { sfiPilot } = require('../../../app/constants/schemes')

let filename
let fileBuffer
let batchExportDate
let scheme

let successfulPaymentRequest
let successfulPaymentRequests

let unsuccessfulPaymentRequest
let unsuccessfulPaymentRequests

let paymentRequestsCollection

describe('Parse and send events on success or failure', () => {
  beforeEach(async () => {
    filename = 'SITIELM0001_AP_20210812105407541.dat'
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')
    batchExportDate = '2021-08-12'
    scheme = {
      name: 'SFI Pilot',
      schemeId: 2,
      fileMask: /^SITIELM\d{4}_AP_\d*.dat$/,
      sourceSystem: 'SFIP'
    }

    successfulPaymentRequest = {
      paymentRequestId: 1
    }

    successfulPaymentRequests = [successfulPaymentRequest]

    unsuccessfulPaymentRequest = {
      paymentRequestId: 2
    }

    unsuccessfulPaymentRequests = [unsuccessfulPaymentRequest]

    paymentRequestsCollection = { successfulPaymentRequests, unsuccessfulPaymentRequests }

    getPaymentRequestsFromFile.mockResolvedValue({
      paymentRequestsCollection,
      batchExportDate
    })
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should send batch processed events before sending messages and invalid events', async () => {
    const callOrder = []

    sendBatchProcessedEvents.mockImplementation(() => Promise.resolve(callOrder.push('processed')))
    sendPaymentBatchMessages.mockImplementation(() => Promise.resolve(callOrder.push('messages')))
    sendPaymentRequestInvalidEvents.mockImplementation(() => Promise.resolve(callOrder.push('invalid')))

    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(callOrder).toEqual(['processed', 'messages', 'invalid'])
  })

  test('does not send messages or invalid events if sendBatchProcessedEvents fails and logs the error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    sendBatchProcessedEvents.mockRejectedValue(new Error('Event publish failed'))

    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(result).toBe(false)
    expect(sendPaymentBatchMessages).not.toHaveBeenCalled()
    expect(sendPaymentRequestInvalidEvents).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `parsePaymentFile error for ${filename}:`,
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  test('messages are sent even if sendPaymentRequestInvalidEvents fails, and error is logged', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    sendPaymentBatchMessages.mockResolvedValue()
    sendPaymentRequestInvalidEvents.mockRejectedValue(new Error('Invalid events failed'))

    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalled()
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalled()
    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
    `parsePaymentFile error for ${filename}:`,
    expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  test('logs parsing error when getPaymentRequestsFromFile rejects', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getPaymentRequestsFromFile.mockRejectedValue(new Error('Invalid file - Unknown line'))

    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)

    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `parsePaymentFile error for ${filename}:`,
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  test('should call getPaymentRequestsFromFile when valid filename, fileBuffer scheme  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(getPaymentRequestsFromFile).toHaveBeenCalled()
  })

  test('should call getPaymentRequestsFromFile once when valid filename, fileBuffer scheme  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(getPaymentRequestsFromFile).toHaveBeenCalledTimes(1)
  })

  test('should call getPaymentRequestsFromFile with fileBuffer  when valid filename, fileBuffer scheme  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(getPaymentRequestsFromFile).toHaveBeenCalledWith(fileBuffer, sfiPilot, filename)
  })

  test('should call getPaymentRequestsFromFile when invalid filename, fileBuffer and scheme sequence are received', async () => {
    filename = ''
    fileBuffer = ''

    await parsePaymentFile(filename, fileBuffer, sfiPilot)

    expect(getPaymentRequestsFromFile).toHaveBeenCalled()
  })

  test('should call getPaymentRequestsFromFile once when invalid filename, fileBuffer and scheme sequence are received', async () => {
    filename = ''
    fileBuffer = ''

    await parsePaymentFile(filename, fileBuffer, sfiPilot)

    expect(getPaymentRequestsFromFile).toHaveBeenCalledTimes(1)
  })

  test('should call getPaymentRequestsFromFile with fileBuffer and scheme when invalid filename, fileBuffer scheme  are received', async () => {
    filename = ''
    fileBuffer = ''

    await parsePaymentFile(filename, fileBuffer, sfiPilot)

    expect(getPaymentRequestsFromFile).toHaveBeenCalledWith(fileBuffer, sfiPilot, filename)
  })

  test('should call sendBatchProcessedEvents when getPaymentRequestsFromFile.paymentRequests returns 1 successfulPaymentRequests', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvents once when getPaymentRequestsFromFile.paymentRequests returns 1 successfulPaymentRequests', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchProcessedEvents with paymentRequestsCollection.successfulPaymentRequests, filename and batch export date when getPaymentRequestsFromFile.paymentRequests returns 1 successfulPaymentRequests', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests, filename, scheme)
  })

  test('should call sendBatchProcessedEvents when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvents once when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchProcessedEvents with filename, paymentRequestsCollection.successfulPaymentRequests and batch export date when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests, filename, scheme)
  })

  test('should call sendBatchProcessedEvents when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvents once when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchProcessedEvents with an empty array, filename and batchExportDate when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendBatchProcessedEvents).toHaveBeenCalledWith([], filename, scheme)
  })

  test('should call sendPaymentBatchMessages when valid filename, fileBuffer  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalled()
  })

  test('should call sendPaymentBatchMessages once when getPaymentRequestsFromFile.paymentRequests returns 1 successfulPaymentRequests', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentBatchMessages with paymentRequestsCollection.successfulPaymentRequests when valid filename, fileBuffer  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests)
  })

  test('should call sendPaymentBatchMessages when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalled()
  })

  test('should call sendPaymentBatchMessages once when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentBatchMessages with paymentRequestsCollection.successfulPaymentRequests when getPaymentRequestsFromFile.paymentRequests returns 2 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests.push(successfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests)
  })

  test('should call sendPaymentBatchMessages when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalled()
  })

  test('should call sendPaymentBatchMessages once when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentBatchMessages with an empty array when getPaymentRequestsFromFile.paymentRequests returns 0 successfulPaymentRequests', async () => {
    paymentRequestsCollection.successfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentBatchMessages).toHaveBeenCalledWith([])
  })

  test('should call sendPaymentRequestInvalidEvents when valid filename, fileBuffer  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalled()
  })

  test('should call sendPaymentRequestInvalidEvents once when getPaymentRequestsFromFile.paymentRequests returns 1 unsuccessfulPaymentRequests', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentRequestInvalidEvents with paymentRequestsCollection.unsuccessfulPaymentRequests when valid filename, fileBuffer  are received', async () => {
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledWith(paymentRequestsCollection.unsuccessfulPaymentRequests)
  })

  test('should call sendPaymentRequestInvalidEvents when getPaymentRequestsFromFile.paymentRequests returns 2 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests.push(unsuccessfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalled()
  })

  test('should call sendPaymentRequestInvalidEvents once when getPaymentRequestsFromFile.paymentRequests returns 2 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests.push(unsuccessfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentRequestInvalidEvents with paymentRequestsCollection.unsuccessfulPaymentRequests when getPaymentRequestsFromFile.paymentRequests returns 2 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests.push(unsuccessfulPaymentRequest)
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledWith(paymentRequestsCollection.unsuccessfulPaymentRequests)
  })

  test('should call sendPaymentRequestInvalidEvents when getPaymentRequestsFromFile.paymentRequests returns 0 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalled()
  })

  test('should call sendPaymentRequestInvalidEvents once when getPaymentRequestsFromFile.paymentRequests returns 0 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledTimes(1)
  })

  test('should call sendPaymentRequestInvalidEvents with an empty array when getPaymentRequestsFromFile.paymentRequests returns 0 unsuccessfulPaymentRequests', async () => {
    paymentRequestsCollection.unsuccessfulPaymentRequests = []
    await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledWith([])
  })

  test('should return true when valid filename, fileBuffer  are received', async () => {
    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(result).toBe(true)
  })

  test('should return false when getPaymentRequestsFromFile rejects', async () => {
    getPaymentRequestsFromFile.mockRejectedValue(new Error('Invalid file - Unknown line'))
    const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
    expect(result).toBe(false)
  })
})
