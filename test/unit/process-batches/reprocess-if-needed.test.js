
const reprocessIfNeeded = require('../../../app/process-batches/reprocess-if-needed')

jest.mock('../../../app/process-batches/batches')
const batches = require('../../../app/process-batches/batches')

jest.mock('../../../app/blob-storage')
const blobStorage = require('../../../app/blob-storage')

jest.mock('../../../app/config/processing')
const processingConfig = require('../../../app/config/processing')

jest.mock('../../../app/process-batches/file-processing-failed')
const fileProcessingFailed = require('../../../app/process-batches/file-processing-failed')

jest.mock('../../../app/process-batches/download-and-parse')
const downloadAndParse = require('../../../app/process-batches/download-and-parse')

global.console.log = jest.fn()

describe('Reprocess if needed', () => {
  let batch
  let schemeType
  const filename = 'SITIELM0001_AP_20220317104956617.dat'

  processingConfig.maxProcessingTries = 1

  beforeEach(() => {
    batch = {
      batchId: 1,
      filename,
      processingTries: 0,
      schemeId: 2,
      sequenceNumber: 1,
      statusId: 1
    }

    schemeType = {
      batchId: '0001',
      date: '2022031',
      prefix: 'AP',
      scheme: 'SFI Pilot',
      source: 'SITIELM'
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('File does not already exist and re-process not required', async () => {
    batches.exists.mockResolvedValue(undefined)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(false)
  })

  test('batch status is in progress with 0 processing tries and downloads and parses', async () => {
    batches.exists.mockResolvedValue(batch)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(true)
    expect(console.log).toHaveBeenLastCalledWith('Tried processing 0 times already')
    expect(downloadAndParse).toHaveBeenCalled()
    expect(batches.incrementProcessingTries).toHaveBeenCalled()
  })

  test('batch status is in progress with 1 processing tries', async () => {
    batch.processingTries = 1
    batches.exists.mockResolvedValue(batch)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(true)
    expect(console.log).toHaveBeenLastCalledWith('Reached max re-tries, failed to process, quarantining')
    expect(fileProcessingFailed).toHaveBeenCalled()
  })

  test('batch status is success and is archived', async () => {
    batch.statusId = 2
    batches.exists.mockResolvedValue(batch)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(true)
    expect(console.log).toHaveBeenLastCalledWith('Previous processing success status set, archiving')
    expect(blobStorage.archivePaymentFile).toHaveBeenCalled()
  })

  test('batch status is failed and is quarantined', async () => {
    batch.statusId = 3
    batches.exists.mockResolvedValue(batch)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(true)
    expect(console.log).toHaveBeenLastCalledWith('Previous processing failure status set, quarantining')
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalled()
  })

  test('batch status is unknown and and file processing is failed', async () => {
    batch.statusId = 4
    batches.exists.mockResolvedValue(batch)
    const response = await reprocessIfNeeded(filename, schemeType)
    expect(response).toBe(true)
    expect(fileProcessingFailed).toHaveBeenCalled()
  })
})