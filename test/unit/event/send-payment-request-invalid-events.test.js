const mockSendEvent = jest.fn()
const mockPublishEvents = jest.fn()

const MockPublishEvent = jest.fn().mockImplementation(() => {
  return {
    sendEvent: mockSendEvent
  }
})

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvents: mockPublishEvents
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEvent: MockPublishEvent,
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config/processing')
const processingConfig = require('../../../app/config/processing')

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

const { sendPaymentRequestInvalidEvents } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_REJECTED } = require('../../../app/constants/events')

let error
let correlationId
let paymentRequest
let paymentRequests

beforeEach(async () => {
  processingConfig.useV1Events = true
  processingConfig.useV2Events = true
  messageConfig.eventTopic = 'v1-events'
  messageConfig.eventsTopic = 'v2-events'

  correlationId = require('../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
  paymentRequests = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequests))

  error = 'Bad payment request'
  paymentRequests.forEach(paymentRequest => { paymentRequest.errorMessage = error })
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 events for processed payment requests', () => {
  test('should send V1 events if V1 events enabled', async () => {
    processingConfig.useV1Events = true
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('should not send V1 events if V1 events disabled', async () => {
    processingConfig.useV1Events = false
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should create a new uuid as Id', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(uuidv4).toHaveBeenCalledTimes(1)
    expect(mockSendEvent.mock.calls[0][0].properties.id).toBe(correlationId)
  })

  test('should raise payment request invalid event name', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-payment-request-invalid')
  })

  test('should raise success status event', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('should raise info event type', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe('error')
  })

  test('should include error message in event', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent.mock.calls[0][0].properties.action.message).toBe(`Payment request could not be processed. Error(s): ${error}`)
  })

  test('should include payment request in event', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.paymentRequest).toMatchObject(paymentRequest)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockSendEvent).toHaveBeenCalledTimes(2)
  })
})

describe('V2 events for processed payment requests', () => {
  test('should send V2 event if V2 events enabled', async () => {
    processingConfig.useV2Events = true
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents).toHaveBeenCalled()
  })

  test('should not send V2 event if V2 events disabled', async () => {
    processingConfig.useV2Events = false
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch processor source', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].source).toBe(SOURCE)
  })

  test('should raise extracted event type', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].type).toBe(PAYMENT_REJECTED)
  })

  test('should include payment request in event data', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toMatchObject(paymentRequest)
  })

  test('should include error message in event data', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].data.message).toBe(error)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
