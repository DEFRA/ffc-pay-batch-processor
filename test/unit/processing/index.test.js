jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')

const config = require('../../../app/config/processing')

jest.mock('../../../app/processing/poll-inbound')
const pollInbound = require('../../../app/processing/poll-inbound')

const processing = require('../../../app/processing')

describe('start processing', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call pollInbound once', async () => {
    await processing.start()
    expect(pollInbound).toHaveBeenCalledTimes(1)
  })

  test('should call setTimeout once', async () => {
    await processing.start()
    expect(setTimeout).toHaveBeenCalledTimes(1)
  })

  test('should not throw when pollInbound rejects', async () => {
    pollInbound.mockRejectedValue(new Error('Processing issue'))

    await expect(processing.start()).resolves.not.toThrow()
  })

  test('should call setTimeout with processing.start and correct interval', async () => {
    await processing.start()
    expect(setTimeout).toHaveBeenCalledWith(processing.start, config.pollingInterval)
  })

  test('should call setTimeout even if pollInbound throws', async () => {
    pollInbound.mockRejectedValue(new Error('Processing issue'))

    await processing.start()
    expect(setTimeout).toHaveBeenCalled()
  })
})
