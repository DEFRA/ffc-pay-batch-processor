const processingConfig = require('../../app/config/processing')

jest.mock('../../app/server')
const { start: mockStartServer } = require('../../app/server')

jest.mock('../../app/processing')
const { start: mockStartProcessing } = require('../../app/processing')

const startApp = require('../../app')

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
