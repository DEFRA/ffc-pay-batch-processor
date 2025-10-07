const mockPublishEvents = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvents: mockPublishEvents
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { sendPaymentRequestInvalidEvents } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_REJECTED } = require('../../../app/constants/events')

let error
let paymentRequest
let paymentRequests

describe('V2 events for processed payment requests', () => {
  beforeEach(async () => {
    messageConfig.eventsTopic = 'v2-events'

    paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequests))

    error = 'Bad payment request'
    paymentRequests.forEach(paymentRequest => { paymentRequest.errorMessage = error })
  })

  afterEach(async () => {
    jest.clearAllMocks()
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

  test('should include error message in event data', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].data.message).toBe(error)
  })

  test('should include payment request in event data', async () => {
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toMatchObject(paymentRequest)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendPaymentRequestInvalidEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
