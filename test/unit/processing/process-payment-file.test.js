jest.mock('../../../app/event')
const { sendBatchErrorEvent } = require('../../../app/event')

jest.mock('../../../app/processing/reprocess-if-needed')
const reprocessIfNeeded = require('../../../app/processing/reprocess-if-needed')

jest.mock('../../../app/processing/process-if-valid')
const processIfValid = require('../../../app/processing/process-if-valid')

const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const processPaymentFile = require('../../../app/processing/process-payment-file')

const { SFI_PILOT } = getSchemeIds()
const { SFI_PILOT: SFI_PILOT_SOURCE_SYSTEM } = getSourceSystems()

const sfiPilot = {
  schemeId: SFI_PILOT,
  sourceSystem: SFI_PILOT_SOURCE_SYSTEM
}

describe('processPaymentFile', () => {
  const filename = 'SITIELM0001_AP_20220317104956617.dat'

  beforeEach(() => {
    jest.clearAllMocks()
    reprocessIfNeeded.mockResolvedValue(false)
    processIfValid.mockResolvedValue()
    sendBatchErrorEvent.mockResolvedValue()
  })

  test('should call reprocessIfNeeded with filename and scheme', async () => {
    await processPaymentFile(filename, sfiPilot)

    expect(reprocessIfNeeded).toHaveBeenCalledWith(filename, sfiPilot)
  })

  test('should not process the file again when it was previously processed', async () => {
    reprocessIfNeeded.mockResolvedValue(true)

    await processPaymentFile(filename, sfiPilot)

    expect(processIfValid).not.toHaveBeenCalled()
  })

  test('should process the file when it has not been previously processed', async () => {
    await processPaymentFile(filename, sfiPilot)

    expect(processIfValid).toHaveBeenCalledWith(sfiPilot, filename)
  })

  test('should not throw when processing fails', async () => {
    const error = new Error('Processing failed')
    processIfValid.mockRejectedValue(error)

    await expect(processPaymentFile(filename, sfiPilot)).resolves.toBeUndefined()

    expect(sendBatchErrorEvent).toHaveBeenCalledWith(filename, error)
  })

  test('should send a batch error event when reprocessing fails', async () => {
    const error = new Error('Reprocessing failed')
    reprocessIfNeeded.mockRejectedValue(error)

    await expect(processPaymentFile(filename, sfiPilot)).resolves.toBeUndefined()

    expect(sendBatchErrorEvent).toHaveBeenCalledWith(filename, error)
    expect(processIfValid).not.toHaveBeenCalled()
  })
})
