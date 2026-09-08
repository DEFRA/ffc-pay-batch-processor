const processingConfig = require('../../app/config/processing')

jest.mock('../../app/server')
const { start: mockStartServer } = require('../../app/server')

jest.mock('../../app/processing')
const { start: mockStartProcessing } = require('../../app/processing')

jest.mock('../../app/update-schemes-database', () => ({
  updateSchemesDatabase: jest.fn()
}))
const { updateSchemesDatabase: mockUpdateSchemesDatabase } = require('../../app/update-schemes-database')

const startApp = require('../../app')

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
})
