const mockSendEvent = jest.fn()
const mockPublishEvent = jest.fn()

const MockPublishEvent = jest.fn().mockImplementation(() => {
  return {
    sendEvent: mockSendEvent
  }
})

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
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

const { sendBatchQuarantineEvent } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { BATCH_QUARANTINED } = require('../../../app/constants/events')

let filename
let correlationId

beforeEach(async () => {
  processingConfig.useV1Events = true
  processingConfig.useV2Events = true
  messageConfig.eventTopic = 'v1-events'
  messageConfig.eventsTopic = 'v2-events'

  correlationId = require('../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  filename = 'SITIELM0001_AP_1.dat'
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 events for batch quarantine', () => {
  test('should send V1 events if V1 events enabled', async () => {
    processingConfig.useV1Events = true
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('should not send V1 events if V1 events disabled', async () => {
    processingConfig.useV1Events = false
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should create a new uuid as Id', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(uuidv4).toHaveBeenCalledTimes(1)
    expect(mockSendEvent.mock.calls[0][0].properties.id).toBe(correlationId)
  })

  test('should raise batch quarantine event name', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-quarantine-error')
  })

  test('should raise error status event', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('should raise error event type', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe('error')
  })

  test('should include filename in event', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockSendEvent.mock.calls[0][0].properties.action.data.filename).toBe(filename)
  })
})

describe('V2 events for batch quarantine', () => {
  test('should send V2 event if V2 events enabled', async () => {
    processingConfig.useV2Events = true
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 event if V2 events disabled', async () => {
    processingConfig.useV2Events = false
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch processor source', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise quarantined event type', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_QUARANTINED)
  })

  test('should include filename in event data', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].data.filename).toBe(filename)
  })

  test('should include error message in event data', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].data.message).toBe('Batch quarantined')
  })
})
