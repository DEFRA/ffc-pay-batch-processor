const reprocessIfNeeded = require('../../../app/processing/reprocess-if-needed')

jest.mock('../../../app/processing/batch')
const batch = require('../../../app/processing/batch')

jest.mock('../../../app/storage')
const blobStorage = require('../../../app/storage')

jest.mock('../../../app/processing/file-processing-failed')
const fileProcessingFailed = require('../../../app/processing/file-processing-failed')

jest.mock('../../../app/processing/download-and-parse')
const downloadAndParse = require('../../../app/processing/download-and-parse')

jest.mock('../../../app/processing/quarantine-file')
const quarantineFile = require('../../../app/processing/quarantine-file')

global.console.log = jest.fn()

describe('reprocessIfNeeded status handling', () => {
  const cases = [
    { statusId: 1, expectedLog: 'Tried processing 0 times already', expectedCall: 'downloadAndParse' },
    { statusId: 2, expectedLog: 'Previous processing success status set, archiving', expectedCall: 'archivePaymentFile' },
    { statusId: 3, expectedLog: 'Previous processing failure status set, quarantining', expectedCall: 'quarantineFile' },
    { statusId: 4, expectedLog: null, expectedCall: 'fileProcessingFailed' }
  ]

  test.each(cases)(
    'should handle batch statusId $statusId correctly',
    async ({ statusId, expectedLog, expectedCall }) => {
      const filename = 'SITIELM0001_AP_20220317104956617.dat'
      const schemeType = { batchId: '0001', date: '2022031', prefix: 'AP', scheme: 'SFI Pilot', source: 'SITIELM' }
      const existingBatch = { batchId: 1, filename, processingTries: 0, schemeId: 2, sequenceNumber: 1, statusId }

      batch.exists.mockResolvedValue(existingBatch)
      await reprocessIfNeeded(filename, schemeType)

      if (expectedLog) {
        expect(console.log).toHaveBeenLastCalledWith(expectedLog)
      }

      switch (expectedCall) {
        case 'downloadAndParse':
          expect(downloadAndParse).toHaveBeenCalled()
          break
        case 'archivePaymentFile':
          expect(blobStorage.archivePaymentFile).toHaveBeenCalled()
          break
        case 'quarantineFile':
          expect(quarantineFile).toHaveBeenCalled()
          break
        case 'fileProcessingFailed':
          expect(fileProcessingFailed).toHaveBeenCalled()
          break
      }
    }
  )
})
