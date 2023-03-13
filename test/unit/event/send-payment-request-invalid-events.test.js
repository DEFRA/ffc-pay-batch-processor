// const mockSendEvents = jest.fn()
// const mockPublishEvents = jest.fn()
// const MockPublishEventBatch = jest.fn().mockImplementation(() => {
//   return {
//     sendEvents: mockSendEvents
//   }
// })
// const MockEventPublisher = jest.fn().mockImplementation(() => {
//   return {
//     publishEvents: mockPublishEvents
//   }
// })
// jest.mock('ffc-pay-event-publisher', () => {
//   return {
//     PublishEventBatch: MockPublishEventBatch,
//     EventPublisher: MockEventPublisher
//   }
// })

// jest.mock('uuid')
// const { v4: uuidv4 } = require('uuid')

// jest.mock('../../../app/config/processing')
// const config = require('../../../app/config/processing')

// jest.mock('../../../app/event/send-payment-request-invalid-event')
// const sendPaymentRequestInvalidEvent = require('../../../app/event/send-payment-request-invalid-event')
// const sendPaymentRequestInvalidEvents = require('../../../app/event/send-payment-request-invalid-events')
// let paymentRequest
// let paymentRequests
// let event
// let events

// beforeEach(async () => {
//   const correlationId = require('../../mockCorrelationId')
//   uuidv4.mockReturnValue(correlationId)
//   config.useV1Events = true
//   config.useV2Events = true
//   config.eventTopic = 'v1-events'
//   config.eventsTopic = 'v2-events'

//   paymentRequest = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequest))
//   paymentRequests = JSON.parse(JSON.stringify(require('../../mockPaymentRequest').paymentRequests))

//   paymentRequest.errorMessage = 'Invalid invoice lines received'
//   paymentRequests = [paymentRequest]

//   event = {
//     id: correlationId,
//     name: 'batch-processing-payment-request-invalid',
//     type: 'error',
//     message: `Payment request could not be processed. Error(s): ${paymentRequest.errorMessage}`,
//     data: { paymentRequest }
//   }

//   events = [event]
// })

// afterEach(async () => {
//   jest.resetAllMocks()
// })

// describe('V1 invalid payment request event', () => {
//   test('should send V1 event if V1 events enabled', async () => {
//     config.useV1Events = true
//     await sendPaymentRequestInvalidEvents(paymentRequest)
//     expect(mockSendEvents).toHaveBeenCalled()
//   })

//   test('should not send V1 event if V1 events disabled', async () => {
//     config.useV1Events = false
//     await sendPaymentRequestInvalidEvents(paymentRequest)
//     expect(mockSendEvents).not.toHaveBeenCalled()
//   })

//   test('should call uuidv4 when paymentRequests are received', async () => {
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(uuidv4).toHaveBeenCalled()
//   })

//   test('should call uuidv4 once when paymentRequests are received', async () => {
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(uuidv4).toHaveBeenCalledTimes(1)
//   })

//   test('should not call uuidv4 when an empty array is received', async () => {
//     await sendPaymentRequestInvalidEvents([])
//     expect(uuidv4).not.toHaveBeenCalled()
//   })

//   test('should not call uuidv4 when an empty string is received', async () => {
//     await sendPaymentRequestInvalidEvents('')
//     expect(uuidv4).not.toHaveBeenCalled()
//   })

//   test('should not call uuidv4 when an object is received', async () => {
//     await sendPaymentRequestInvalidEvents({})
//     expect(uuidv4).not.toHaveBeenCalled()
//   })

//   test('should not call uuidv4 when undefined is received', async () => {
//     await sendPaymentRequestInvalidEvents(undefined)
//     expect(uuidv4).not.toHaveBeenCalled()
//   })

//   test('should not call uuidv4 when null is received', async () => {
//     await sendPaymentRequestInvalidEvents(null)
//     expect(uuidv4).not.toHaveBeenCalled()
//   })

//   test('should call sendPaymentRequestInvalidEvent when paymentRequests has 1 payment request is received', async () => {
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalled()
//   })

//   test('should call sendPaymentRequestInvalidEvent once when paymentRequests has 1 payment request is received', async () => {
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledTimes(1)
//   })

//   test('should call sendPaymentRequestInvalidEvent with event when paymentRequests has 1 payment request is received', async () => {
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledWith(event)
//   })

//   test('should call sendPaymentRequestInvalidEvent when paymentRequests with 2 payment requests are received', async () => {
//     paymentRequests.push(paymentRequest)
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalled()
//   })

//   test('should call sendPaymentRequestInvalidEvent twice when paymentRequests with 2 payment requests are received', async () => {
//     paymentRequests.push(paymentRequest)
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalledTimes(2)
//   })

//   test('should call sendPaymentRequestInvalidEvent with each event including each payment request in data when paymentRequests with 2 payment requests are received', async () => {
//     paymentRequests.push(paymentRequest)

//     await sendPaymentRequestInvalidEvents(paymentRequests)

//     event = {
//       ...event,
//       id: uuidv4()
//     }
//     events = [{
//       ...event,
//       data: { paymentRequest: paymentRequests[0] }
//     },
//     {
//       ...event,
//       data: { paymentRequest: paymentRequests[1] }
//     }]
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(1, events[0])
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(2, events[1])
//   })

//   test('should call sendPaymentRequestInvalidEvent when paymentRequests with 2 valid payment requests and 1 invalid payment request are received', async () => {
//     paymentRequests.push(paymentRequest)
//     await sendPaymentRequestInvalidEvents(paymentRequests)
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenCalled()
//   })

//   test('should call sendPaymentRequestInvalidEvent twice when paymentRequests with 2 valid payment requests and 1 invalid payment request are received', async () => {
//     config.useV2Events = false
//     paymentRequests.push(undefined)
//     paymentRequests.push(paymentRequest)

//     await sendPaymentRequestInvalidEvents(paymentRequests)

//     expect(sendPaymentRequestInvalidEvent).toBeCalledTimes(2)
//   })

//   test('should call sendPaymentRequestInvalidEvent with valid payment requests when paymentRequests with 2 valid payment requests and 1 invalid payment request are received', async () => {
//     config.useV2Events = false
//     paymentRequests.push(undefined)
//     paymentRequests.push(paymentRequest)

//     await sendPaymentRequestInvalidEvents(paymentRequests)

//     events = [event, event]
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(1, events[0])
//     expect(sendPaymentRequestInvalidEvent).toHaveBeenNthCalledWith(2, events[1])
//   })

//   test('should not call sendPaymentRequestInvalidEvent when an empty array is received', async () => {
//     await sendPaymentRequestInvalidEvents([])
//     expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
//   })

//   test('should not call sendPaymentRequestInvalidEvent when an empty string is received', async () => {
//     await sendPaymentRequestInvalidEvents('')
//     expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
//   })

//   test('should not call sendPaymentRequestInvalidEvent when an object is received', async () => {
//     await sendPaymentRequestInvalidEvents({})
//     expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
//   })

//   test('should not call sendPaymentRequestInvalidEvent when undefined is received', async () => {
//     await sendPaymentRequestInvalidEvents(undefined)
//     expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
//   })

//   test('should not call sendPaymentRequestInvalidEvent when null is received', async () => {
//     await sendPaymentRequestInvalidEvents(null)
//     expect(sendPaymentRequestInvalidEvent).not.toHaveBeenCalled()
//   })

//   test('should not reject when sendPaymentRequestInvalidEvent rejects', async () => {
//     await sendPaymentRequestInvalidEvent.mockReturnValue('Mocking sendPaymentRequestInvalidEvent returning error message')

//     const wrapper = async () => {
//       await sendPaymentRequestInvalidEvents(paymentRequests)
//     }

//     expect(wrapper).not.toThrow()
//   })
// })

// describe('V2 invalid payment request event', () => {
//   test('should send V2 event if V2 events enabled', async () => {
//     config.useV2Events = true
//     await sendPaymentRequestInvalidEvents(paymentRequest)
//     expect(mockSendEvents).toHaveBeenCalled()
//   })

//   test('should not send V2 event if V2 events disabled', async () => {
//     config.useV2Events = false
//     await sendPaymentRequestInvalidEvents(paymentRequest)
//     expect(mockSendEvents).not.toHaveBeenCalled()
//   })
// })
