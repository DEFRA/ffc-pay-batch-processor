const processPaymentFile = require('../../../app/processing/process-payment-file')

jest.mock('../../../app/processing/batch')
const batch = require('../../../app/processing/batch')

jest.mock('../../../app/storage')
const storage = require('../../../app/storage')

jest.mock('../../../app/processing/reprocess-if-needed')
const reprocessIfNeeded = require('../../../app/processing/reprocess-if-needed')

jest.mock('../../../app/processing/download-and-parse')
const downloadAndParse = require('../../../app/processing/download-and-parse')
const { sfiPilot } = require('../../../app/schemes')

global.console.error = jest.fn()
global.console.log = jest.fn()

let filename

describe('Process payment file', () => {
  beforeEach(() => {
    filename = 'SITIELM0001_AP_20220317104956617.dat'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should not process file again if previously processed', async () => {
    reprocessIfNeeded.mockResolvedValue(true)
    await processPaymentFile(filename, sfiPilot)
    expect(batch.nextSequenceId).not.toHaveBeenCalled()
  })

  test('Both current sequence and expected sequence are equal so download and parse', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, sfiPilot)
    expect(batch.create).toHaveBeenCalled()
    expect(downloadAndParse).toHaveBeenCalled()
  })

  test('current sequence is greater than expected sequence and is ignored', async () => {
    filename = 'SITIELM0002_AP_20220317104956617.dat'
    batch.nextSequenceId.mockResolvedValue(1)
    await processPaymentFile(filename, sfiPilot)
    expect(console.log.mock.calls[1][0]).toContain(`Ignoring ${filename}, expected sequence id 1`)
  })

  test('currentSequence is less than expectedSequence and is quarantined', async () => {
    batch.nextSequenceId.mockResolvedValue(2)
    await processPaymentFile(filename, sfiPilot)
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
    expect(console.log.mock.calls[1][0]).toContain(`Quarantining ${filename}, sequence id 1 below expected`)
  })

  test('expectedSequence is undefined and is quarantined', async () => {
    batch.nextSequenceId.mockResolvedValue(undefined)
    await processPaymentFile(filename, sfiPilot)
    expect(storage.quarantinePaymentFile).toHaveBeenCalled()
    expect(console.log).toHaveBeenLastCalledWith(`Quarantining ${filename}, unable to get expected sequence id from database`)
  })
})
