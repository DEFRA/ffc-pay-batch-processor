const { v4: uuidv4 } = require('uuid')
const sendPaymentRequestInvalidEvent = require('./send-payment-request-invalid-event')

const sendPaymentRequestInvalidEvents = async (paymentRequests) => {
  if (paymentRequests?.length) {
    const events = []
    for (const paymentRequest of paymentRequests) {
      try {
        events.push({
          id: uuidv4(),
          name: 'batch-processing-payment-request-invalid',
          type: 'error',
          message: 'Payment request could not be processed',
          data: { paymentRequest: paymentRequest.a }
        })
      } catch {
        throw (new Error('Could not generate batch-processing-payment-request-invalid event for ', paymentRequest))
      }
    }

    console.log(events.length)

    for (const x of events) {
      await sendPaymentRequestInvalidEvent(x)
    }
  }
}

module.exports = sendPaymentRequestInvalidEvents
