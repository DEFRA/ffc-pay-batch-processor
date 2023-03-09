jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/send-batch-processing-event')
const sendBatchProcessedEvent = require('../../../app/event/send-batch-processing-event')

jest.mock('../../../app/config/processing')
const config = require('../../../app/config/processing')

const { sendBatchProcessedEvents } = require('../../../app/event')

let filename
let sequence
let batchExportDate

let paymentRequest
let paymentRequests

let event
let events

describe('Sending events for unprocessable payment requests', () => {
  beforeEach(async () => {
    config.useV1Events = true
    config.useV2Events = true

    const correlationId = require('../../mockCorrelationId')
    uuidv4.mockReturnValue(correlationId)

    filename = 'SITIELM0001_AP_1.dat'
    sequence = '0001'
    batchExportDate = '2021-08-12'

    paymentRequest = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequests))

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
    config.useV2Events = false
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
    config.useV2Events = false
    await sendBatchProcessedEvent.mockReturnValue('Mocking sendBatchProcessedEvent returning error message')

    const wrapper = async () => {
      await sendBatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
    }

    expect(wrapper).not.toThrow()
  })
})
