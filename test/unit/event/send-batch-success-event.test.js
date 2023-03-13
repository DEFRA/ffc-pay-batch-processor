const mockPublishEvent = jest.fn()
const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config/processing')
const processingConfig = require('../../../app/config/processing')

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { SOURCE } = require('../../../app/constants/source')
const { BATCH_PROCESSED } = require('../../../app/constants/events')

const sendBatchSuccessEvent = require('../../../app/event/send-batch-success-event')

const filename = 'SITIELM0001_AP_20210812105407541.dat'

beforeEach(async () => {
  processingConfig.useV2Events = true
  messageConfig.eventsTopic = 'v2-events'
})

afterEach(async () => {
  jest.clearAllMocks()
})

describe('V2 send batch success event', () => {
  test('send V2 events when v2 events enabled ', async () => {
    processingConfig.useV2Events = true
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 events when v2 events disabled ', async () => {
    processingConfig.useV2Events = false
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchSuccessEvent(filename)
    console.log(MockEventPublisher.mock.calls[0][0])
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch-processor source', async () => {
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise an event with batch rejected event', async () => {
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_PROCESSED)
  })

  test('should include filename as event subject', async () => {
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].subject).toBe(filename)
  })

  test('should include filename in the event data', async () => {
    await sendBatchSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].data.filename).toBe(filename)
  })
})
