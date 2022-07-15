jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

const { sendBatchProcessedEvent } = require('../../../app/event')

let paymentRequest
let event

describe('Sending event for unprocessable payment request', () => {
  beforeEach(async () => {
    const correlationId = require('../../mockCorrelationId')

    paymentRequest = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequest))

    event = {
      id: correlationId,
      name: 'batch-processing',
      type: 'info',
      message: 'Payment request created from batch file',
      data: {
        filename: 'SITIELM0001_AP_1.dat',
        sequence: '0001',
        batchExportDate: '2021-08-12',
        paymentRequest
      }
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call raiseEvent when an event is received', async () => {
    await sendBatchProcessedEvent(event)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an event is received', async () => {
    await sendBatchProcessedEvent(event)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event when an event is received', async () => {
    await sendBatchProcessedEvent(event)
    expect(raiseEvent).toHaveBeenCalledWith(event)
  })

  test('should call raiseEvent when an empty array is received', async () => {
    await sendBatchProcessedEvent([])
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty array is received', async () => {
    await sendBatchProcessedEvent([])
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty array when an empty array is received', async () => {
    await sendBatchProcessedEvent([])
    expect(raiseEvent).toHaveBeenCalledWith([])
  })

  test('should call raiseEvent when an empty string is received', async () => {
    await sendBatchProcessedEvent('')
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty string is received', async () => {
    await sendBatchProcessedEvent('')
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty string when an empty string is received', async () => {
    await sendBatchProcessedEvent('')
    expect(raiseEvent).toHaveBeenCalledWith('')
  })

  test('should call raiseEvent when an empty object is received', async () => {
    await sendBatchProcessedEvent({})
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty object is received', async () => {
    await sendBatchProcessedEvent({})
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty object when an empty object is received', async () => {
    await sendBatchProcessedEvent({})
    expect(raiseEvent).toHaveBeenCalledWith({})
  })

  test('should call raiseEvent when undefined is received', async () => {
    await sendBatchProcessedEvent(undefined)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when undefined is received', async () => {
    await sendBatchProcessedEvent(undefined)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with undefined when undefined is received', async () => {
    await sendBatchProcessedEvent(undefined)
    expect(raiseEvent).toHaveBeenCalledWith(undefined)
  })

  test('should call raiseEvent when null is received', async () => {
    await sendBatchProcessedEvent(null)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when null is received', async () => {
    await sendBatchProcessedEvent(null)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with null when null is received', async () => {
    await sendBatchProcessedEvent(null)
    expect(raiseEvent).toHaveBeenCalledWith(null)
  })

  test('should not reject when raiseEvent rejects', async () => {
    await raiseEvent.mockRejectedValue(new Error('Mocking raiseEvent error'))

    const wrapper = async () => {
      await sendBatchProcessedEvent(event)
    }

    expect(wrapper).not.toThrow()
  })
})
