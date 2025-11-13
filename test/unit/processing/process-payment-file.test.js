const processPaymentFile = require('../../../app/processing/process-payment-file')

jest.mock('../../../app/processing/batch')
const batch = require('../../../app/processing/batch')

jest.mock('../../../app/processing/quarantine-file')
const quarantineFile = require('../../../app/processing/quarantine-file')

jest.mock('../../../app/processing/reprocess-if-needed')
const reprocessIfNeeded = require('../../../app/processing/reprocess-if-needed')

jest.mock('../../../app/processing/download-and-parse')
const downloadAndParse = require('../../../app/processing/download-and-parse')
const { sfiPilot } = require('../../../app/constants/schemes')

let filename

describe('processPaymentFile', () => {
  beforeEach(() => {
    filename = 'SITIELM0001_AP_20220317104956617.dat'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should not check next sequence Id if file previously processed', async () => {
    reprocessIfNeeded.mockResolvedValue(true)
    await processPaymentFile(filename, sfiPilot)
    expect(batch.nextSequenceId).not.toHaveBeenCalled()
  })

  test('should download and parse file if matches expected sequence', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, sfiPilot)
    expect(batch.create).toHaveBeenCalled()
    expect(downloadAndParse).toHaveBeenCalled()
  })

  test.each([
    { desc: 'next sequence higher than expected', filename: 'SITIELM0002_AP_20220317104956617.dat', nextSeq: 1 },
    { desc: 'next sequence lower than expected', filename: 'SITIELM0001_AP_20220317104956617.dat', nextSeq: 2 },
    { desc: 'next sequence undefined', filename: 'SITIELM0001_AP_20220317104956617.dat', nextSeq: undefined }
  ])(
    'should handle file correctly when $desc',
    async ({ filename: file, nextSeq }) => {
      filename = file
      batch.nextSequenceId.mockResolvedValue(nextSeq)

      await processPaymentFile(filename, sfiPilot)

      if (nextSeq === 1) {
        expect(downloadAndParse).not.toHaveBeenCalled()
        expect(quarantineFile).not.toHaveBeenCalled()
      } else {
        expect(quarantineFile).toHaveBeenCalled()
        expect(downloadAndParse).not.toHaveBeenCalled()
      }
    }
  )
})
