jest.mock('../../../app/storage')
const storage = require('../../../app/storage')

jest.mock('../../../app/event/send-batch-quarantine-event')
const sendBatchQuarantineEvent = require('../../../app/event/send-batch-quarantine-event')

const quarantinePaymentFile = require('../../../app/processing/quarantine-file')

describe('quarantinePaymentFile', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const testValues = [
    { desc: 'a filename', value: 'SITIELM0001_AP_20210812105407541.dat' },
    { desc: 'an empty string', value: '' },
    { desc: 'an object', value: {} },
    { desc: 'an array', value: [] },
    { desc: 'undefined', value: undefined },
    { desc: 'null', value: null }
  ]

  test.each(testValues)(
    'should call storage.quarantinePaymentFile and sendBatchQuarantineEvent when $desc is received',
    async ({ value }) => {
      await quarantinePaymentFile(value)

      expect(storage.quarantinePaymentFile).toHaveBeenCalledTimes(1)
      expect(storage.quarantinePaymentFile).toHaveBeenCalledWith(value, value)

      expect(sendBatchQuarantineEvent).toHaveBeenCalledTimes(1)
      expect(sendBatchQuarantineEvent).toHaveBeenCalledWith(value)
    }
  )

  test('should return true when storage.quarantinePaymentFile returns true', async () => {
    storage.quarantinePaymentFile.mockReturnValue(true)
    const result = await quarantinePaymentFile('some-file')
    expect(result).toBe(true)
  })

  test('should return false when storage.quarantinePaymentFile returns false', async () => {
    storage.quarantinePaymentFile.mockReturnValue(false)
    const result = await quarantinePaymentFile('some-file')
    expect(result).toBe(false)
  })
})
