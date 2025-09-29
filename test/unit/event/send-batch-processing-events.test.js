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

const { sendBatchProcessedEvents } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_EXTRACTED } = require('../../../app/constants/events')

let filename
let scheme

let paymentRequest
let paymentRequests

describe('V2 events for processed payment requests', () => {
  beforeEach(async () => {
    messageConfig.eventsTopic = 'v2-events'

    filename = 'SITIELM0001_AP_1.dat'
    scheme = require('../../../app/constants/schemes').sfiPilot

    paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequests))
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch processor source', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].source).toBe(SOURCE)
  })

  test('should raise extracted event type', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].type).toBe(PAYMENT_EXTRACTED)
  })

  test('should raise an event with filename as subject', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].subject).toBe(filename)
  })

  test('should include scheme in event data', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].data.schemeId).toBe(scheme.schemeId)
  })

  test('should include payment request in event data', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toMatchObject(paymentRequest)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendBatchProcessedEvents(paymentRequests, filename, scheme)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
