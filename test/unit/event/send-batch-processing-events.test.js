const mockPublishEvents = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => ({
  publishEvents: mockPublishEvents
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const { sendBatchProcessedEvents } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_EXTRACTED } = require('../../../app/constants/events')

const { SFI_PILOT } = getSchemeIds()
const { SFI_PILOT: SFI_PILOT_SOURCE_SYSTEM } = getSourceSystems()

let filename
let scheme
let paymentRequest
let paymentRequests

describe('V2 events for processed payment requests', () => {
  beforeEach(() => {
    messageConfig.eventsTopic = 'v2-events'

    filename = 'SITIELM0001_AP_1.dat'
    scheme = {
      schemeId: SFI_PILOT,
      sourceSystem: SFI_PILOT_SOURCE_SYSTEM
    }

    paymentRequest = structuredClone(
      require('../../mocks/payment-request').paymentRequest
    )
    paymentRequests = structuredClone(
      require('../../mocks/payment-request').paymentRequests
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send an event for each payment request to the correct topic with correct data', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    await sendBatchProcessedEvents(paymentRequests, filename, scheme)

    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)

    mockPublishEvents.mock.calls[0][0].forEach(event => {
      expect(event.source).toBe(SOURCE)
      expect(event.type).toBe(PAYMENT_EXTRACTED)
      expect(event.subject).toBe(filename)
      expect(event.data.schemeId).toBe(scheme.schemeId)
      expect(event.data).toMatchObject(paymentRequest)
    })

    expect(mockPublishEvents.mock.calls[0][0]).toHaveLength(
      paymentRequests.length
    )
  })
})
