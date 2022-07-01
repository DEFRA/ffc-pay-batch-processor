const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')

const sendPaymentRequestInvalidEvent = async (paymentRequest) => {
  const event = {
    id: uuidv4(),
    name: 'batch-processing-payment-request-invalid',
    type: 'error',
    message: 'Payment request could not be processed',
    data: {
      paymentRequest
    }
  }
  await raiseEvent(event, 'error')
}

module.exports = sendPaymentRequestInvalidEvent
