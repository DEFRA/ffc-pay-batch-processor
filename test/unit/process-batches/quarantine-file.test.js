jest.mock('../../../app/blob-storage')
const blobStorage = require('../../../app/blob-storage')

jest.mock('../../../app/event/send-batch-quarantine-event')
const sendBatchQuarantineEvent = require('../../../app/event/send-batch-quarantine-event')

const quarantineFile = require('../../../app/process-batches/quarantine-file')

const filename = 'SITIELM0001_AP_20210812105407541.dat'
const error = 'Error: Invalid file - Unknown line'

describe('quarantine file', () => {
  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call blobStorage.quarantinePaymentFile when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with filename and filename when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalledWith(filename, filename)
  })

  test('should call blobStorage.quarantinePaymentFile when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('should call blobStorage.quarantinePaymentFile once when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
  })

  test('should call blobStorage.quarantinePaymentFile with filename and filename when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalledWith(filename, filename)
  })

  test('should call sendBatchQuarantineEvent when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with filename and error when a filename and error are received', async () => {
    await quarantineFile(filename, error)
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(filename, error)
  })

  test('should call sendBatchQuarantineEvent when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(sendBatchQuarantineEvent).toHaveBeenCalled()
  })

  test('should call sendBatchQuarantineEvent once when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchQuarantineEvent with filename and no error when a filename and no error are received', async () => {
    await quarantineFile(filename, '')
    expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(filename, '')
  })

  test('should return true when blobStorage.quarantinePaymentFile returns true', async () => {
    blobStorage.quarantinePaymentFile.mockReturnValue(true)
    const result = await quarantineFile(filename, error)
    expect(result).toBe(true)
  })

  test('should return false when blobStorage.quarantinePaymentFile returns false', async () => {
    blobStorage.quarantinePaymentFile.mockReturnValue(false)
    const result = await quarantineFile(filename, error)
    expect(result).toBe(false)
  })
})
