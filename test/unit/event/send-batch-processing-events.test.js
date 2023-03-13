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

const { sendBatchProcessedEvents } = require('../../../app/event')

let filename
let sequence
let batchExportDate

let paymentRequest
let paymentRequests

let event
let events

describe('V1 Events Only: Sending events for unprocessable payment requests', () => {
  beforeEach(async () => {
    uuidv4.mockImplementation(() => { '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c' })

    processingConfig.useV1Events = true
    processingConfig.useV2Events = true
    messageConfig.eventTopic = 'v1-events'
    messageConfig.eventsTopic = 'v2-events'

    const correlationId = require('../../mocks/correlation-id')
    uuidv4.mockReturnValue(correlationId)

    filename = 'SITIELM0001_AP_1.dat'
    sequence = '0001'
    batchExportDate = '2021-08-12'

    paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mocks/payment-request').paymentRequests))

    event = {
      id: correlationId,
      name: 'batch-processing',
      type: 'info',
      message: 'Payment request created from batch file',
      data: {
        filename,
        sequence,
        batchExportDate,
        paymentRequest
      }
    }

    events = [event]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when paymentRequests, filename, sequence and batchExportDate are received', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when paymentRequests, filename, sequence and batchExportDate are received', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should not call uuidv4 when an empty array is received', async () => {
    await sendBatchProcessedEvents([])
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when an empty string is received', async () => {
    await sendBatchProcessedEvents('')
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when an object is received', async () => {
    await sendBatchProcessedEvents({})
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when undefined is received', async () => {
    await sendBatchProcessedEvents(undefined)
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should not call uuidv4 when null is received', async () => {
    await sendBatchProcessedEvents(null)
    expect(uuidv4).not.toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvent when paymentRequests has 1 payment request, filename, sequence and batchExportDate are received', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvent once when paymentRequests has 1 payment request, filename, sequence and batchExportDate are received', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalledTimes(1)
  })

  test('should call sendBatchProcessedEvent with event when paymentRequests has 1 payment request, filename, sequence and batchExportDate are received', async () => {
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalledWith(event)
  })

  test('should call sendBatchProcessedEvent when paymentRequests with 2 payment requests, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(paymentRequest)
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvent twice when paymentRequests with 2 payment requests, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(paymentRequest)
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalledTimes(2)
  })

  test('should call sendBatchProcessedEvent with each event including each payment request in data when paymentRequests with 2 payment requests, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(paymentRequest)

    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)

    event = {
      ...event,
      id: uuidv4()
    }
    events = [{
      ...event,
      data: {
        ...event.data,
        paymentRequest: paymentRequests[0]
      }
    },
    {
      ...event,
      data: {
        ...event.data,
        paymentRequest: paymentRequests[1]
      }
    }]
    expect(sendBatchProcessedEvent).toHaveBeenNthCalledWith(1, events[0])
    expect(sendBatchProcessedEvent).toHaveBeenNthCalledWith(2, events[1])
  })

  test('should call sendBatchProcessedEvent when paymentRequests with 2 valid payment requests and 1 invalid payment request, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(paymentRequest)
    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    expect(sendBatchProcessedEvent).toHaveBeenCalled()
  })

  test('should call sendBatchProcessedEvent twice when paymentRequests with 2 valid payment requests and 1 invalid payment request, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(undefined)
    paymentRequests.push(paymentRequest)

    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)

    expect(sendBatchProcessedEvent).toBeCalledTimes(2)
  })

  test('should call sendBatchProcessedEvent with valid payment requests when paymentRequests with 2 valid payment requests and 1 invalid payment request, filename, sequence and batchExportDate are received', async () => {
    paymentRequests.push(undefined)
    paymentRequests.push(paymentRequest)

    await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)

    events = [event, event]
    expect(sendBatchProcessedEvent).toHaveBeenNthCalledWith(1, events[0])
    expect(sendBatchProcessedEvent).toHaveBeenNthCalledWith(2, events[1])
  })

  test('should not call sendBatchProcessedEvent when an empty array is received', async () => {
    await sendBatchProcessedEvents([])
    expect(sendBatchProcessedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendBatchProcessedEvent when an empty string is received', async () => {
    await sendBatchProcessedEvents('')
    expect(sendBatchProcessedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendBatchProcessedEvent when an object is received', async () => {
    await sendBatchProcessedEvents({})
    expect(sendBatchProcessedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendBatchProcessedEvent when undefined is received', async () => {
    await sendBatchProcessedEvents(undefined)
    expect(sendBatchProcessedEvent).not.toHaveBeenCalled()
  })

  test('should not call sendBatchProcessedEvent when null is received', async () => {
    await sendBatchProcessedEvents(null)
    expect(sendBatchProcessedEvent).not.toHaveBeenCalled()
  })

  test('should not reject when sendBatchProcessedEvent rejects', async () => {
    await sendBatchProcessedEvent.mockReturnValue('Mocking sendBatchProcessedEvent returning error message')

    const wrapper = async () => {
      await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    }

    await expect(wrapper).not.toThrow()
  })
})
