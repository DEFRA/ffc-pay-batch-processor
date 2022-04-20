jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

const sendBatchErrorEvent = require('../../../app/event/send-batch-error-event')

const filename = 'SITIELM0001_AP_20210812105407541.dat'
const error = {
  message: 'Payment file could not be parsed.'
}

let event

describe('Sending event for unparsable SITI payment file', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    event = {
      name: 'batch-processing-error',
      type: 'error'
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when a filename and error is received', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call raiseEvent when a filename and error is received', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent with event and "error" when a filename and error is received', async () => {
    event = {
      ...event,
      id: uuidv4(),
      message: error.message,
      data: { filename }
    }

    await sendBatchErrorEvent(filename, error)
    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })
})
