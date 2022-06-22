jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

const sendBatchQuarantineEvent = require('../../../app/event/send-batch-quarantine-event')

let filename
let event

describe('Sending event for quarantined SITI payment file', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    filename = 'SITIELM0001_AP_20210812105407541.dat'

    event = {
      name: 'batch-processing-quarantine-error',
      type: 'error',
      message: `Quarantined ${filename}`,
      data: {
        filename
      }
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when a filename is received', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when a filename is received', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when no filename is received', async () => {
    filename = ''
    await sendBatchQuarantineEvent(filename)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when no filename is received', async () => {
    filename = ''
    await sendBatchQuarantineEvent(filename)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent when a filename is received', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when a filename is received', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when a filename is received', async () => {
    event = {
      ...event,
      id: uuidv4()
    }

    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when no filename is received', async () => {
    filename = ''
    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when no filename is received', async () => {
    filename = ''
    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when no filename is received', async () => {
    filename = ''
    event = {
      ...event,
      message: `Quarantined ${filename}`,
      id: uuidv4(),
      data: {
        ...event.data,
        filename
      }
    }

    await sendBatchQuarantineEvent(filename)
    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })
})
