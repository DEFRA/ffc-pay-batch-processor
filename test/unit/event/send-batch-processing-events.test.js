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

const { sendBatchProcessedEvents } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_EXTRACTED } = require('../../../app/constants/events')

let filename
let sequence
let batchExportDate
let scheme

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

  filename = 'SITIELM0001_AP_1.dat'
  sequence = '0001'
  batchExportDate = '2021-08-12'
  scheme = require('../../../app/schemes').sfiPilot

  paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
  paymentRequests = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequests))
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 events for processed payment requests', () => {
  test('should send V1 events if V1 events enabled', async () => {
    processingConfig.useV1Events = true
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('should not send V1 events if V1 events disabled', async () => {
    processingConfig.useV1Events = false
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should create a new uuid as Id if payment request does not have correlation Id', async () => {
    paymentRequest.correlationId = undefined
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(uuidv4).toHaveBeenCalledTimes(1)
    expect(mockSendEvent.mock.calls[0][0].properties.id).toBe(correlationId)
  })

  test('should raise batch processing event name', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing')
  })

  test('should raise success status event', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('success')
  })

  test('should raise info event type', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe('info')
  })

  test('should include filename in event', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.filename).toBe(filename)
  })

  test('should include sequence in event', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.sequence).toBe(sequence)
  })

  test('should include batch export date in event', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.batchExportDate).toBe(batchExportDate)
  })

  test('should include payment request in event', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.paymentRequest).toEqual(paymentRequest)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockSendEvent).toHaveBeenCalledTimes(2)
  })
})

describe('V2 enrichment error event', () => {
  test('should send V2 event if V2 events enabled', async () => {
    processingConfig.useV2Events = true
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents).toHaveBeenCalled()
  })

  test('should not send V2 event if V2 events disabled', async () => {
    processingConfig.useV2Events = false
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch processor source', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].source).toBe(SOURCE)
  })

  test('should raise extracted event type', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].type).toBe(PAYMENT_EXTRACTED)
  })

  test('should include payment request in event data', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toMatchObject(paymentRequest)
  })

  test('should include scheme in event data', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents.mock.calls[0][0][0].data.schemeId).toBe(scheme.schemeId)
  })

  test('should send event for every payment request', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
