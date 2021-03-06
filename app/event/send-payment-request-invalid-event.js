const raiseEvent = require('./raise-event')

const sendPaymentRequestInvalidEvent = async (paymentRequest) => {
  try {
    await raiseEvent(paymentRequest, 'error')
  } catch {
    console.error('Could not send batch-processing-payment-request-invalid event for', paymentRequest)
  }
}

module.exports = sendPaymentRequestInvalidEvent
