const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => ({
  publishEvent: mockPublishEvent
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { sendBatchQuarantineEvent } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { BATCH_QUARANTINED } = require('../../../app/constants/events')

let filename

describe('V2 events for batch quarantine', () => {
  beforeEach(() => {
    messageConfig.eventsTopic = 'v2-events'
    filename = 'SITIELM0001_AP_1.dat'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send batch quarantine event with correct properties', async () => {
    await sendBatchQuarantineEvent(filename)

    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)

    const event = mockPublishEvent.mock.calls[0][0]

    const expectedProperties = {
      source: SOURCE,
      type: BATCH_QUARANTINED,
      subject: filename,
      data: {
        message: 'Batch quarantined',
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
