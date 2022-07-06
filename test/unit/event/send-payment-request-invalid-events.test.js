jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/raise-event-batch')
const raiseEventBatch = require('../../../app/event/raise-event-batch')

const { sendPaymentRequestInvalidEvents } = require('../../../app/event')

let paymentRequest
let paymentRequests
let event
let events

describe('Sending events for unprocessable payment requests', () => {
  beforeEach(async () => {
    uuidv4.mockReturnValue(require('../../mockCorrelationId'))

    paymentRequest = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequests))

    event = {
      name: 'batch-processing-payment-request-invalid',
      type: 'error',
      message: 'Payment request could not be processed'
    }

    events = [event]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when paymentRequests are received', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when paymentRequests are received', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should not call uuidv4 when an empty array is received', async () => {
    await sendPaymentRequestInvalidEvents([])
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvents('')
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when an object is received', async () => {
    await sendPaymentRequestInvalidEvents({})
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when undefined is received', async () => {
    await sendPaymentRequestInvalidEvents(undefined)
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when null is received', async () => {
    await sendPaymentRequestInvalidEvents(null)
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should call raiseEventBatch when paymentRequests has 1 payment request is received', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(raiseEventBatch).toHaveBeenCalled()
  })

  test('should call raiseEventBatch once when paymentRequests has 1 payment request is received', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(raiseEventBatch).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEventBatch with events and "error" when paymentRequests has 1 payment request is received', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)

    event = {
      ...event,
      id: uuidv4(),
      data: { paymentRequest }
    }
    events = [event]
    expect(raiseEventBatch).toHaveBeenCalledWith(events, 'error')
  })

  test('should call raiseEventBatch when paymentRequests with 2 payment requests are received', async () => {
    paymentRequests.push(paymentRequest)
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(raiseEventBatch).toHaveBeenCalled()
  })

  test('should call raiseEventBatch once when paymentRequests with 2 payment requests are received', async () => {
    paymentRequests.push(paymentRequest)
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(raiseEventBatch).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEventBatch with event including each payment request in data and "error" when paymentRequests with 2 payment requests are received', async () => {
    paymentRequests.push(paymentRequest)

    await sendPaymentRequestInvalidEvents(paymentRequests)

    event = {
      ...event,
      id: uuidv4()
    }
    events = [{
      ...event,
      data: { paymentRequest: paymentRequests[0] }
    },
    {
      ...event,
      data: { paymentRequest: paymentRequests[1] }
    }]
    expect(raiseEventBatch).toHaveBeenCalledWith(events, 'error')
  })

  test('should not call raiseEventBatch when an empty array is received', async () => {
    await sendPaymentRequestInvalidEvents([])
    expect(raiseEventBatch).not.toHaveBeenCalled()
  })

  test('should not call raiseEventBatch when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvents('')
    expect(raiseEventBatch).not.toHaveBeenCalled()
  })

  test('should not call raiseEventBatch when an object is received', async () => {
    await sendPaymentRequestInvalidEvents({})
    expect(raiseEventBatch).not.toHaveBeenCalled()
  })

  test('should not call raiseEventBatch when undefined is received', async () => {
    await sendPaymentRequestInvalidEvents(undefined)
    expect(raiseEventBatch).not.toHaveBeenCalled()
  })

  test('should not call raiseEventBatch when null is received', async () => {
    await sendPaymentRequestInvalidEvents(null)
    expect(raiseEventBatch).not.toHaveBeenCalled()
  })
})
