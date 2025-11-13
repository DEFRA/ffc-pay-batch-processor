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

describe('parseAndSendEventsOnSuccessOrFailure', () => {
  beforeEach(async () => {
    filename = 'SITIELM0001_AP_20210812105407541.dat'
    fileBuffer = Buffer.from(
      'B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n'
    )
    batchExportDate = '2021-08-12'
    scheme = {
      name: 'SFI Pilot',
      schemeId: 2,
      fileMask: /^SITIELM\d{4}_AP_\d*.dat$/,
      sourceSystem: 'SFIP'
    }

    successfulPaymentRequest = { paymentRequestId: 1 }
    successfulPaymentRequests = [successfulPaymentRequest]

    unsuccessfulPaymentRequest = { paymentRequestId: 2 }
    unsuccessfulPaymentRequests = [unsuccessfulPaymentRequest]

    paymentRequestsCollection = { successfulPaymentRequests, unsuccessfulPaymentRequests }

    getPaymentRequestsFromFile.mockResolvedValue({
      paymentRequestsCollection,
      batchExportDate
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getPaymentRequestsFromFile', () => {
    test.each([
      { desc: 'valid filename and fileBuffer', f: () => {} },
      { desc: 'invalid filename and fileBuffer', f: () => { filename = ''; fileBuffer = '' } }
    ])('should call getPaymentRequestsFromFile when $desc', async ({ f }) => {
      f()
      await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(getPaymentRequestsFromFile).toHaveBeenCalled()
      expect(getPaymentRequestsFromFile).toHaveBeenCalledTimes(1)
      expect(getPaymentRequestsFromFile).toHaveBeenCalledWith(fileBuffer, sfiPilot, filename)
    })
  })

  describe('sendBatchProcessedEvents', () => {
    test.each([
      { desc: '1 successfulPaymentRequest', count: 1 },
      { desc: '2 successfulPaymentRequests', count: 2 },
      { desc: '0 successfulPaymentRequests', count: 0 }
    ])('should call sendBatchProcessedEvents correctly when $desc', async ({ count }) => {
      paymentRequestsCollection.successfulPaymentRequests = Array(count).fill(successfulPaymentRequest)
      await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(sendBatchProcessedEvents).toHaveBeenCalled()
      expect(sendBatchProcessedEvents).toHaveBeenCalledTimes(1)
      expect(sendBatchProcessedEvents).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests, filename, scheme)
    })
  })

  describe('sendPaymentBatchMessages', () => {
    test.each([
      { desc: '1 successfulPaymentRequest', count: 1 },
      { desc: '2 successfulPaymentRequests', count: 2 },
      { desc: '0 successfulPaymentRequests', count: 0 }
    ])('should call sendPaymentBatchMessages correctly when $desc', async ({ count }) => {
      paymentRequestsCollection.successfulPaymentRequests = Array(count).fill(successfulPaymentRequest)
      await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(sendPaymentBatchMessages).toHaveBeenCalled()
      expect(sendPaymentBatchMessages).toHaveBeenCalledTimes(1)
      expect(sendPaymentBatchMessages).toHaveBeenCalledWith(paymentRequestsCollection.successfulPaymentRequests)
    })
  })

  describe('sendPaymentRequestInvalidEvents', () => {
    test.each([
      { desc: '1 unsuccessfulPaymentRequest', count: 1 },
      { desc: '2 unsuccessfulPaymentRequests', count: 2 },
      { desc: '0 unsuccessfulPaymentRequests', count: 0 }
    ])('should call sendPaymentRequestInvalidEvents correctly when $desc', async ({ count }) => {
      paymentRequestsCollection.unsuccessfulPaymentRequests = Array(count).fill(unsuccessfulPaymentRequest)
      await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(sendPaymentRequestInvalidEvents).toHaveBeenCalled()
      expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledTimes(1)
      expect(sendPaymentRequestInvalidEvents).toHaveBeenCalledWith(paymentRequestsCollection.unsuccessfulPaymentRequests)
    })
  })

  describe('return values', () => {
    test('should return true when valid filename and fileBuffer are received', async () => {
      const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(result).toBe(true)
    })

    test('should return false when getPaymentRequestsFromFile rejects', async () => {
      getPaymentRequestsFromFile.mockRejectedValue(new Error('Invalid file - Unknown line'))
      const result = await parsePaymentFile(filename, fileBuffer, sfiPilot)
      expect(result).toBe(false)
    })
  })
})
