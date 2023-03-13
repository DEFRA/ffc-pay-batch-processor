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

const { SOURCE } = require('../../../app/constants/source')
const { BATCH_REJECTED } = require('../../../app/constants/events')
const { BATCH_PROCESSING_ERROR } = require('../../../app/constants/event-name')

const sendBatchErrorEvent = require('../../../app/event/send-batch-error-event')

const filename = 'SITIELM0001_AP_20210812105407541.dat'
const error = {
  message: 'Payment file could not be parsed.'
}

let event

beforeEach(async () => {
  uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

  processingConfig.useV1Events = true
  processingConfig.useV2Events = true
  messageConfig.eventTopic = 'v1-events'
  messageConfig.eventsTopic = 'v2-events'

  event = {
    name: 'batch-processing-error',
    type: 'error'
  }
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V1 send batch error event for SITI payment file that cannot be parsed', () => {
  test('when V1 events enabled should call mockSendEvent when a filename and error is received', async () => {
    processingConfig.useV1Events = true
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent).toHaveBeenCalled()
  })

  test('when V1 events disabled should not call mockSendEvent when a filename and error is received', async () => {
    processingConfig.useV1Events = false
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(MockPublishEvent.mock.calls[0][0]).toBe(messageConfig.eventTopic)
  })

  test('should call uuidv4 when a filename and error is received', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should raise event with batch-processing-error event name', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent.mock.calls[0][0].name).toBe(BATCH_PROCESSING_ERROR)
  })

  test('should raise event with error status', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('should raise error event type', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent.mock.calls[0][0].properties.action.type).toBe(event.type)
  })

  test('should include error message in event', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockSendEvent.mock.calls[0][0].properties.action.message).toBe(error.message)
  })

  test('should throw error if no error provided', async () => {
    await expect(() => sendBatchErrorEvent(filename)).rejects.toThrow()
  })
})

describe('V2 send batch error event for SITI payment file that cannot be parsed', () => {
  test('send V2 events when v2 events enabled ', async () => {
    processingConfig.useV2Events = true
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    processingConfig.useV2Events = false
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch-processor source', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with batch rejected event', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_REJECTED)
  })

  test('should include error message in the event data', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].data.message).toBe(error.message)
  })

  test('should include filename in the event data', async () => {
    await sendBatchErrorEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].data.filename).toBe(filename)
  })
})
