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
jest.mock('../../../app/config/message')

const messageConfig = require('../../../app/config/message')
const { SOURCE } = require('../../../app/constants/source')
const { BATCH_REJECTED } = require('../../../app/constants/events')
const sendBatchErrorEvent = require('../../../app/event/send-batch-error-event')

const filename = 'SITIELM0001_AP_20210812105407541.dat'
const error = { message: 'Payment file could not be parsed.' }

describe('v2SendBatchErrorEvent', () => {
  beforeEach(async () => {
    messageConfig.eventsTopic = 'v2-events'
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  const eventAssertions = [
    ['should send event to V2 topic', (call) => expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)],
    ['should raise an event with batch-processor source', (call) => expect(call.source).toBe(SOURCE)],
    ['should raise an event with batch rejected event type', (call) => expect(call.type).toBe(BATCH_REJECTED)],
    ['should raise an event with filename as subject', (call) => expect(call.subject).toBe(filename)],
    ['should include error message in the event data', (call) => expect(call.data.message).toBe(error.message)],
    ['should include filename in the event data', (call) => expect(call.data.filename).toBe(filename)]
  ]

  test.each(eventAssertions)('%s', async (_, assertion) => {
    await sendBatchErrorEvent(filename, error)
    const call = mockPublishEvent.mock.calls[0][0]
    assertion(call)
  })

  test('should throw error if no error provided', async () => {
    await expect(() => sendBatchErrorEvent(filename)).rejects.toThrow()
  })
})
