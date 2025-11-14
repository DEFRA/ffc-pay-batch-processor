jest.mock('../../app/storage')
const storage = require('../../app/storage')

jest.mock('../../app/processing/parse-payment-file')
const parsePaymentFile = require('../../app/processing/parse-payment-file')

jest.mock('../../app/processing/batch')
const batch = require('../../app/processing/batch')

jest.mock('../../app/processing/file-processing-failed')
const fileProcessingFailed = require('../../app/processing/file-processing-failed')

jest.mock('../../app/event')
const { sendBatchSuccessEvent, sendBatchErrorEvent } = require('../../app/event')

const downloadAndParse = require('../../app/processing/download-and-parse')
const { sfiPilot } = require('../../app/constants/schemes')

let filename
let scheme
let buffer

describe('download and parse', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    filename = 'SITIELM0001_AP_20210812105407541.dat'
    scheme = sfiPilot
    buffer = Buffer.from('test file content')

    storage.downloadPaymentFile.mockResolvedValue(buffer)
    parsePaymentFile.mockResolvedValue(true)
    sendBatchSuccessEvent.mockResolvedValue(undefined)
    batch.updateStatus.mockResolvedValue(undefined)
    storage.archivePaymentFile.mockResolvedValue(undefined)
    fileProcessingFailed.mockResolvedValue(undefined)

    batch.status = {
      success: 1,
      failed: 2,
      inProgress: 3
    }

    global.console.log = jest.fn()
    global.console.error = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('successful parsing', () => {
    test('should download payment file', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.downloadPaymentFile).toHaveBeenCalledWith(filename)
    })

    test('should download payment file once', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.downloadPaymentFile).toHaveBeenCalledTimes(1)
    })

    test('should parse payment file with correct parameters', async () => {
      await downloadAndParse(filename, scheme)
      expect(parsePaymentFile).toHaveBeenCalledWith(filename, buffer, scheme)
    })

    test('should parse payment file once', async () => {
      await downloadAndParse(filename, scheme)
      expect(parsePaymentFile).toHaveBeenCalledTimes(1)
    })

    test('should log archiving message when parsing succeeds', async () => {
      await downloadAndParse(filename, scheme)
      expect(console.log).toHaveBeenCalledWith(`Archiving ${filename}, successfully parsed file`)
    })

    test('should send batch success event when parsing succeeds', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchSuccessEvent).toHaveBeenCalledWith(filename)
    })

    test('should send batch success event once when parsing succeeds', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchSuccessEvent).toHaveBeenCalledTimes(1)
    })

    test('should update batch status to success', async () => {
      await downloadAndParse(filename, scheme)
      expect(batch.updateStatus).toHaveBeenCalledWith(filename, batch.status.success)
    })

    test('should update batch status once', async () => {
      await downloadAndParse(filename, scheme)
      expect(batch.updateStatus).toHaveBeenCalledTimes(1)
    })

    test('should archive payment file', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.archivePaymentFile).toHaveBeenCalledWith(filename, filename)
    })

    test('should archive payment file once', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.archivePaymentFile).toHaveBeenCalledTimes(1)
    })

    test('should not call file processing failed when parsing succeeds', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).not.toHaveBeenCalled()
    })

    test('should not call send batch error event when parsing succeeds and success event succeeds', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchErrorEvent).not.toHaveBeenCalled()
    })
  })

  describe('successful parsing but batch success event fails', () => {
    let error

    beforeEach(() => {
      error = new Error('Failed to send batch success event')
      sendBatchSuccessEvent.mockRejectedValue(error)
    })

    test('should log error message when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(console.error).toHaveBeenCalledWith(`Failed to send batch success event for ${filename}:`, error)
    })

    test('should send batch error event when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchErrorEvent).toHaveBeenCalledWith(filename, error)
    })

    test('should send batch error event once when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchErrorEvent).toHaveBeenCalledTimes(1)
    })

    test('should call file processing failed when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).toHaveBeenCalledWith(filename)
    })

    test('should call file processing failed once when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).toHaveBeenCalledTimes(1)
    })

    test('should not update batch status when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(batch.updateStatus).not.toHaveBeenCalled()
    })

    test('should not archive payment file when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.archivePaymentFile).not.toHaveBeenCalled()
    })

    test('should return early when batch success event fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.archivePaymentFile).not.toHaveBeenCalled()
    })
  })

  describe('successful parsing but batch success event fails and sendBatchErrorEvent is not a function', () => {
    beforeEach(() => {
      const error = new Error('Failed to send batch success event')
      sendBatchSuccessEvent.mockRejectedValue(error)
      sendBatchErrorEvent.mockImplementation(undefined)
    })

    test('should not throw error when sendBatchErrorEvent is not a function', async () => {
      await expect(downloadAndParse(filename, scheme)).resolves.not.toThrow()
    })

    test('should still call file processing failed when sendBatchErrorEvent is not a function', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).toHaveBeenCalledWith(filename)
    })
  })

  describe('failed parsing', () => {
    beforeEach(() => {
      parsePaymentFile.mockResolvedValue(false)
    })

    test('should log quarantine message when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(console.log).toHaveBeenCalledWith(`Quarantining ${filename}, failed to parse file`)
    })

    test('should call file processing failed when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).toHaveBeenCalledWith(filename)
    })

    test('should call file processing failed once when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(fileProcessingFailed).toHaveBeenCalledTimes(1)
    })

    test('should not send batch success event when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchSuccessEvent).not.toHaveBeenCalled()
    })

    test('should not update batch status when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(batch.updateStatus).not.toHaveBeenCalled()
    })

    test('should not archive payment file when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(storage.archivePaymentFile).not.toHaveBeenCalled()
    })

    test('should not send batch error event when parsing fails', async () => {
      await downloadAndParse(filename, scheme)
      expect(sendBatchErrorEvent).not.toHaveBeenCalled()
    })
  })
})
