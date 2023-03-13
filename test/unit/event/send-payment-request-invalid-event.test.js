jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

const { sendPaymentRequestInvalidEvent } = require('../../../app/event')

let paymentRequest
let event

describe('Sending event for unprocessable payment request', () => {
  beforeEach(async () => {
    const correlationId = require('../../mocks/correlation-id')

    paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
    paymentRequest.errorMessage = 'Invalid invoice lines received'

    event = {
      id: correlationId,
      name: 'batch-processing-payment-request-invalid',
      type: 'error',
      message: `Payment request could be processed. Error(s): ${paymentRequest.errorMessage}`,
      data: { paymentRequest }
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call raiseEvent when an event is received', async () => {
    await sendPaymentRequestInvalidEvent(event)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an event is received', async () => {
    await sendPaymentRequestInvalidEvent(event)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with paymentRequest and "error" when an event is received', async () => {
    await sendPaymentRequestInvalidEvent(event)
    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when an empty array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty array and "error" when an empty array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(raiseEvent).toHaveBeenCalledWith([], 'error')
  })

  test('should call raiseEvent when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty string and "error" when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(raiseEvent).toHaveBeenCalledWith('', 'error')
  })

  test('should call raiseEvent when an empty object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with an empty object and "error" when an empty object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(raiseEvent).toHaveBeenCalledWith({}, 'error')
  })

  test('should call raiseEvent when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with undefined and "error" when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(raiseEvent).toHaveBeenCalledWith(undefined, 'error')
  })

  test('should call raiseEvent when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with null and "error" when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(raiseEvent).toHaveBeenCalledWith(null, 'error')
  })

  test('should not reject when raiseEvent rejects', async () => {
    await raiseEvent.mockRejectedValue(new Error('Mocking raiseEvent error'))

    const wrapper = async () => {
      await sendPaymentRequestInvalidEvent(event)
    }

    expect(wrapper).not.toThrow()
  })
})
