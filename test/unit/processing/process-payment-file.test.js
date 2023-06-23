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

describe('Process payment file', () => {
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

  test('should ignore file if next sequence is higher than expected', async () => {
    filename = 'SITIELM0002_AP_20220317104956617.dat'
    batch.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, sfiPilot)
    expect(downloadAndParse).not.toHaveBeenCalled()
    expect(quarantineFile).not.toHaveBeenCalled()
  })

  test('should quarantine file if sequence is lower than expected', async () => {
    batch.nextSequenceId.mockResolvedValue(2)
    await processPaymentFile(filename, sfiPilot)
    expect(quarantineFile).toHaveBeenCalled()
    expect(downloadAndParse).not.toHaveBeenCalled()
  })

  test('should quarantine file if next sequence is undefined', async () => {
    batch.nextSequenceId.mockResolvedValue(undefined)
    await processPaymentFile(filename, sfiPilot)
    expect(quarantineFile).toHaveBeenCalled()
    expect(downloadAndParse).not.toHaveBeenCalled()
  })
})
