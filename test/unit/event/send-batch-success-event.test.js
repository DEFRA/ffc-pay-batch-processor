const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => ({
  publishEvent: mockPublishEvent
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { SOURCE } = require('../../../app/constants/source')
const { BATCH_PROCESSED } = require('../../../app/constants/events')

const sendBatchSuccessEvent = require('../../../app/event/send-batch-success-event')

const filename = 'SITIELM0001_AP_20210812105407541.dat'

describe('V2 send batch success event for SITI payment file', () => {
  beforeEach(() => {
    messageConfig.eventsTopic = 'v2-events'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send batch success event with correct properties', async () => {
    await sendBatchSuccessEvent(filename)

    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)

    const event = mockPublishEvent.mock.calls[0][0]

    const expectedProperties = {
      source: SOURCE,
      type: BATCH_PROCESSED,
      subject: filename,
      data: {
        filename
      }
    }

    Object.entries(expectedProperties).forEach(([key, value]) => {
      if (typeof value === 'object') {
        expect(event[key]).toMatchObject(value)
      } else {
        expect(event[key]).toBe(value)
      }
    })
  })
})
