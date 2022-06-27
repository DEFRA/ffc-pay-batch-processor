jest.mock('../../../app/storage')
const storage = require('../../../app/storage')

jest.mock('../../../app/event/send-batch-quarantine-event')
const sendBatchQuarantineEvent = require('../../../app/event/send-batch-quarantine-event')

const quarantinePaymentFile = require('../../../app/processing/quarantine-file')

const filename = 'SITIELM0001_AP_20210812105407541.dat'

describe('quarantine file', () => {
  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call blobStorage.quarantinePaymentFile when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with filename when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith(filename, filename)
  })

  test('should call blobStorage.quarantinePaymentFile when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with empty string when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith('', '')
  })

  test('should call blobStorage.quarantinePaymentFile when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with object when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith({}, {})
  })

  test('should call blobStorage.quarantinePaymentFile when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with array when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith([], [])
  })

  test('should call blobStorage.quarantinePaymentFile when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with undefined when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith(undefined, undefined)
  })

  test('should call blobStorage.quarantinePaymentFile when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with null when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(storage.quarantinePaymentFile).toHaveBeenCalledWith(null, null)
  })

  test('should call sendBatchQuarantineEvent when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with filename when a filename is received', async () => {
    await quarantinePaymentFile(filename)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(filename)
  })

  test('should call sendBatchQuarantineEvent when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with empty string when an empty string is received', async () => {
    await quarantinePaymentFile('')
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith('')
  })

  test('should call sendBatchQuarantineEvent when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with object when an object is received', async () => {
    await quarantinePaymentFile({})
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith({})
  })

  test('should call sendBatchQuarantineEvent when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with array when an array is received', async () => {
    await quarantinePaymentFile([])
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith([])
  })

  test('should call sendBatchQuarantineEvent when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with undefined when undefined is received', async () => {
    await quarantinePaymentFile(undefined)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(undefined)
  })

  test('should call sendBatchQuarantineEvent when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with null when null is received', async () => {
    await quarantinePaymentFile(null)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(null)
  })

  test('should return true when blobStorage.quarantinePaymentFile returns true', async () => {
    storage.quarantinePaymentFile.mockReturnValue(true)
    const result = await quarantinePaymentFile(filename)
    expect(result).toBe(true)
  })

  test('should return false when blobStorage.quarantinePaymentFile returns false', async () => {
    storage.quarantinePaymentFile.mockReturnValue(false)
    const result = await quarantinePaymentFile(filename)
    expect(result).toBe(false)
  })
})
