const processingConfig = require('../../app/config/processing')

jest.mock('../../app/server')
const { start: mockStartServer } = require('../../app/server')

jest.mock('../../app/processing')
const { start: mockStartProcessing } = require('../../app/processing')

jest.mock('../../app/update-schemes-database', () => ({
  updateSchemesDatabase: jest.fn()
}))
const { updateSchemesDatabase: mockUpdateSchemesDatabase } = require('../../app/update-schemes-database')

jest.mock('../../app/messaging/service-bus/sender-cache')
const { closeSenders: mockCloseSenders } = require('../../app/messaging/service-bus/sender-cache')

const startApp = require('../../app')

const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

describe('app start', () => {
  beforeAll(async () => {
    await new Promise(resolve => setImmediate(resolve))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateSchemesDatabase.mockResolvedValue()
  })

  test.each([
    [true, 1, false],
    [false, 0, true]
  ])(
    'processingActive=%p -> processingCalls=%i, logsInfo=%p',
    async (active, processingCalls, logsInfo) => {
      processingConfig.processingActive = active
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => { })

      await startApp()

      expect(mockStartServer).toHaveBeenCalledTimes(1)
      expect(mockUpdateSchemesDatabase).toHaveBeenCalledTimes(1)
      expect(mockStartProcessing).toHaveBeenCalledTimes(processingCalls)

      if (logsInfo) {
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Processing capabilities are currently not enabled in this environment'
          )
        )
      } else {
        expect(consoleInfoSpy).not.toHaveBeenCalled()
      }

      consoleInfoSpy.mockRestore()
    }
  )

  test('logs and exits when startup fails', async () => {
    const error = new Error('startup failed')
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
    const processOnSpy = jest.spyOn(process, 'on').mockReturnThis()

    try {
      jest.isolateModules(() => {
        const { start } = require('../../app/server')
        start.mockRejectedValue(error)
        require('../../app')
      })

      await waitForAsync()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Application failed to start'),
        error
      )
      expect(processExitSpy).toHaveBeenCalledWith(1)
    } finally {
      processOnSpy.mockRestore()
      processExitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    }
  })
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
