
const processPaymentFile = require('../../../app/process-batches/process-payment-file')

jest.mock('../../../app/process-batches/batches')
const batches = require('../../../app/process-batches/batches')

jest.mock('../../../app/blob-storage')
const blobStorage = require('../../../app/blob-storage')

jest.mock('../../../app/process-batches/reprocess-if-needed')
const reprocessIfNeeded = require('../../../app/process-batches/reprocess-if-needed')

jest.mock('../../../app/process-batches/download-and-parse')
const downloadAndParse = require('../../../app/process-batches/download-and-parse')

global.console.error = jest.fn()
global.console.log = jest.fn()

describe('Process payment file', () => {
  let schemeType
  const filename = 'SITIELM0001_AP_20220317104956617.dat'

  beforeEach(() => {
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

  test('File has already been processed', async () => {
    reprocessIfNeeded.mockResolvedValue(true)
    await processPaymentFile(filename, schemeType)
    expect(batches.nextSequenceId).not.toHaveBeenCalled()
  })

  test('An error is thrown with a console.error', async () => {
    reprocessIfNeeded.mockImplementation(() => { throw new Error() })
    await processPaymentFile(filename, schemeType)
    expect(console.error).toHaveBeenCalledTimes(2)
  })

  test('Both currentSequenceId and expectedSequenceId are equal so download and parse', async () => {
    batches.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, schemeType)
    expect(batches.create).toHaveBeenCalled()
    expect(downloadAndParse).toHaveBeenCalled()
  })

  test('currentSequenceId is greater than expectedSequenceId and is ignored', async () => {
    schemeType.batchId = '0002'
    batches.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, schemeType)
    expect(console.log).toHaveBeenLastCalledWith(`Ignoring ${filename}, expected sequence id 1`)
  })

  test('currentSequenceId is less than expectedSequenceId and is quarantined', async () => {
    schemeType.batchId = '0001'
    batches.nextSequenceId.mockResolvedValue(2)
    await processPaymentFile(filename, schemeType)
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalled()
    expect(console.log).toHaveBeenLastCalledWith(`Quarantining ${filename}, sequence id 1 below expected`)
  })

  test('expectedSequenceId is undefined and is quarantined', async () => {
    schemeType.batchId = '0001'
    batches.nextSequenceId.mockResolvedValue(undefined)
    await processPaymentFile(filename, schemeType)
    expect(blobStorage.quarantinePaymentFile).toHaveBeenCalled()
    expect(console.log).toHaveBeenLastCalledWith(`Quarantining ${filename}, unable to get expected sequence id from database`)
  })
})
