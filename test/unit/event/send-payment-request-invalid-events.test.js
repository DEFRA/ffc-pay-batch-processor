jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../app/event/send-payment-request-invalid-event')
const sendPaymentRequestInvalidEvent = require('../../../app/event/send-payment-request-invalid-event')

const { sendPaymentRequestInvalidEvents } = require('../../../app/event')

// let paymentRequest
let paymentRequests
// let event
// let events

describe('Sending events for unprocessable payment requests', () => {
  beforeEach(async () => {
    uuidv4.mockReturnValue(require('../../mockCorrelationId'))

    // paymentRequest = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequest))
    paymentRequests = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequests))

    // event = {
    //   name: 'batch-processing-payment-request-invalid',
    //   type: 'error',
    //   message: 'Payment request could not be processed'
    // }

    // events = [event]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  // test('should call uuidv4 when paymentRequests are received', async () => {
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(uuidv4).toHaveBeenCalled()
  // })

  // test('should call uuidv4 once when paymentRequests are received', async () => {
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(uuidv4).toHaveBeenCalledTimes(1)
  // })

  // test('should not call uuidv4 when an empty array is received', async () => {
  //   await sendPaymentRequestInvalidEvents([])
  //   expect(uuidv4).not.toHaveBeenCalled()
  // })

  // test('should not call uuidv4 when an empty string is received', async () => {
  //   await sendPaymentRequestInvalidEvents('')
  //   expect(uuidv4).not.toHaveBeenCalled()
  // })

  // test('should not call uuidv4 when an object is received', async () => {
  //   await sendPaymentRequestInvalidEvents({})
  //   expect(uuidv4).not.toHaveBeenCalled()
  // })

  // test('should not call uuidv4 when undefined is received', async () => {
  //   await sendPaymentRequestInvalidEvents(undefined)
  //   expect(uuidv4).not.toHaveBeenCalled()
  // })

  // test('should not call uuidv4 when null is received', async () => {
  //   await sendPaymentRequestInvalidEvents(null)
  //   expect(uuidv4).not.toHaveBeenCalled()
  // })

  // test('should call sendPaymentRequestInvalidEvent when paymentRequests has 1 payment request is received', async () => {
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenCalled()
  // })

  // test('should call sendPaymentRequestInvalidEvent once when paymentRequests has 1 payment request is received', async () => {
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledTimes(1)
  // })

  // test('should call sendPaymentRequestInvalidEvent with event when paymentRequests has 1 payment request is received', async () => {
  //   await sendPaymentRequestInvalidEvents(paymentRequests)

  //   event = {
  //     ...event,
  //     id: uuidv4(),
  //     data: { paymentRequest }
  //   }
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledWith(event)
  // })

  // test('should call sendPaymentRequestInvalidEvent when paymentRequests with 2 payment requests are received', async () => {
  //   paymentRequests.push(paymentRequest)
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenCalled()
  // })

  // test('should call sendPaymentRequestInvalidEvent twice when paymentRequests with 2 payment requests are received', async () => {
  //   paymentRequests.push(paymentRequest)
  //   await sendPaymentRequestInvalidEvents(paymentRequests)
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledTimes(2)
  // })

  // test('should call sendPaymentRequestInvalidEvent with each event including each payment request in data when paymentRequests with 2 payment requests are received', async () => {
  //   paymentRequests.push(paymentRequest)

  //   await sendPaymentRequestInvalidEvents(paymentRequests)

  //   event = {
  //     ...event,
  //     id: uuidv4()
  //   }
  //   events = [{
  //     ...event,
  //     data: { paymentRequest: paymentRequests[0] }
  //   },
  //   {
  //     ...event,
  //     data: { paymentRequest: paymentRequests[1] }
  //   }]
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(1, events[0])
  //   expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(2, events[1])
  // })

  // test('should not call sendPaymentRequestInvalidEvent when an empty array is received', async () => {
  //   await sendPaymentRequestInvalidEvents([])
  //   expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
  // })

  // test('should not call sendPaymentRequestInvalidEvent when an empty string is received', async () => {
  //   await sendPaymentRequestInvalidEvents('')
  //   expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
  // })

  // test('should not call sendPaymentRequestInvalidEvent when an object is received', async () => {
  //   await sendPaymentRequestInvalidEvents({})
  //   expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
  // })

  // test('should not call sendPaymentRequestInvalidEvent when undefined is received', async () => {
  //   await sendPaymentRequestInvalidEvents(undefined)
  //   expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
  // })

  // test('should not call sendPaymentRequestInvalidEvent when null is received', async () => {
  //   await sendPaymentRequestInvalidEvents(null)
  //   expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
  // })

  // test('should uuidv4 errors out', async () => {
  //   uuidv4.mockImplementation(() => new Error('fefeka '))
  //   const r = await sendPaymentRequestInvalidEvents([undefined])
  //   console.error(r)
  //   expect(r).toBe('ds')
  // })

  // test('should call sendPaymentRequestInvalidEvent when sendPaymentRequestInvalidEvent errors out', async () => {
  //   sendPaymentRequestInvalidEvent.mockRejectedValue(new Error('Ccsdfsdr '))
  //   const wrapper = async () => {
  //     await sendPaymentRequestInvalidEvents(paymentRequests)
  //   }

  //   await expect(wrapper).rejects.toThrow()
  // })

  test('should call sendPaymentRequestInvalidEvent when sendPaymentRequestInvalidEvent errors out', async () => {
    paymentRequests.push(undefined)
    paymentRequests.push(paymentRequests[0])
    sendPaymentRequestInvalidEvent
      .mockResolvedValueOnce('first call')
      .mockRejectedValueOnce(new Error('Async error message'))
    const wrapper = async () => {
      await sendPaymentRequestInvalidEvents(paymentRequests)
    }

    const r = await wrapper()

    await expect(wrapper).rejects.toThrow()

    // console.log('len', sendPaymentRequestInvalidEvent.mock.calls.length)

    // console.log('whats this', r)
    // expect(r).toBe('ds')

    // await expect(wrapper).rejects.toThrow()
  })
})
