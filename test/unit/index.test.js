const processingConfig = require('../../app/config/processing')

jest.mock('../../app/server')
const { start: mockStartServer } = require('../../app/server')

jest.mock('../../app/processing')
const { start: mockStartProcessing } = require('../../app/processing')

jest.mock('../../app/messaging/service-bus/sender-cache')
const { closeSenders: mockCloseSenders } = require('../../app/messaging/service-bus/sender-cache')

const startApp = require('../../app')

const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

describe('app start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    [true, 1, 1, false],
    [false, 1, 0, true]
  ])(
    'processingActive=%p -> serverCalls=%i, processingCalls=%i, logsInfo=%p',
    async (active, serverCalls, processingCalls, logsInfo) => {
      processingConfig.processingActive = active
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

      await startApp()

      expect(mockStartServer).toHaveBeenCalledTimes(serverCalls)
      expect(mockStartProcessing).toHaveBeenCalledTimes(processingCalls)
      if (logsInfo) {
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Processing capabilities are currently not enabled in this environment')
        )
      } else {
        expect(consoleInfoSpy).not.toHaveBeenCalled()
      }

      consoleInfoSpy.mockRestore()
    }
  )
})

describe('app shutdown', () => {
  let mockExit
  let consoleInfoSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    mockExit.mockRestore()
    consoleInfoSpy.mockRestore()
  })

  test('SIGTERM closes senders and exits', async () => {
    process.emit('SIGTERM')
    await waitForAsync()

    expect(consoleInfoSpy).toHaveBeenCalledWith('Received SIGTERM, closing messaging connections')
    expect(mockCloseSenders).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  test('SIGINT closes senders and exits', async () => {
    process.emit('SIGINT')
    await waitForAsync()

    expect(consoleInfoSpy).toHaveBeenCalledWith('Received SIGINT, closing messaging connections')
    expect(mockCloseSenders).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(0)
  })
})
