jest.mock('../../../app/blob-storage')
const blobStorage = require('../../../app/blob-storage')

jest.mock('../../../app/event/send-batch-quarantine-event')
const sendBatchQuarantineEvent = require('../../../app/event/send-batch-quarantine-event')

const quarantineFile = require('../../../app/process-batches/quarantine-file')

const filename = 'SITIELM0001_AP_20210812105407541.dat'
const error = 'Error: Unclosed root tag'

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
})
