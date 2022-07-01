const { GBP } = require('../../../app/currency')
const { Q4 } = require('../../../app/schedules')
const { sfiPilot } = require('../../../app/schemes')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/raise-event')
const raiseEvent = require('../../../app/event/raise-event')

const sendPaymentRequestInvalidEvent = require('../../../app/event/send-payment-request-invalid-event')

let paymentRequest
let event

describe('Sending event for quarantined DAX response file', () => {
  beforeEach(async () => {
    uuidv4.mockReturnValue('70cb0f07-e0cf-449c-86e8-0344f2c6cc6c')

    paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100,
      deliveryBody: 'RP00',
      invoiceLines: [{
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        description: 'G00 - Gross value of claim',
        value: 100
      }]
    }

    event = {
      name: 'batch-processing-payment-request-invalid',
      type: 'error',
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when a paymentRequest is received', async () => {
    await sendPaymentRequestInvalidEvent(paymentRequest)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when a paymentRequest is received', async () => {
    await sendPaymentRequestInvalidEvent(paymentRequest)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when an object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when an object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when an array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when an array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call uuidv4 when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(uuidv4).toHaveBeenCalled()
  })

  test('should call uuidv4 once when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent when a paymentRequest is received', async () => {
    await sendPaymentRequestInvalidEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when a paymentRequest is received', async () => {
    await sendPaymentRequestInvalidEvent(paymentRequest)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when a paymentRequest is received', async () => {
    event = {
      ...event,
      id: uuidv4()
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an empty string is received', async () => {
    await sendPaymentRequestInvalidEvent('')
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when an empty string is received', async () => {
    paymentRequest = ''
    event = {
      ...event,
      id: uuidv4(),
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when an object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an object is received', async () => {
    await sendPaymentRequestInvalidEvent({})
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when an object is received', async () => {
    paymentRequest = {}
    event = {
      ...event,
      id: uuidv4(),
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when an array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when an array is received', async () => {
    await sendPaymentRequestInvalidEvent([])
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when an array is received', async () => {
    paymentRequest = []
    event = {
      ...event,
      id: uuidv4(),
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when undefined is received', async () => {
    await sendPaymentRequestInvalidEvent(undefined)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when undefined is received', async () => {
    paymentRequest = undefined
    event = {
      ...event,
      id: uuidv4(),
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })

  test('should call raiseEvent when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(raiseEvent).toHaveBeenCalled()
  })

  test('should call raiseEvent once when null is received', async () => {
    await sendPaymentRequestInvalidEvent(null)
    expect(raiseEvent).toHaveBeenCalledTimes(1)
  })

  test('should call raiseEvent with event and "error" when null is received', async () => {
    paymentRequest = null
    event = {
      ...event,
      id: uuidv4(),
      message: 'Payment request could not be processed',
      data: {
        paymentRequest
      }
    }

    await sendPaymentRequestInvalidEvent(paymentRequest)

    expect(raiseEvent).toHaveBeenCalledWith(event, 'error')
  })
})
