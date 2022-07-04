const { v4: uuidv4 } = require('uuid')
const raiseEventBatch = require('./raise-event-batch')

const sendPaymentRequestInvalidEvents = async (paymentRequests) => {
  if (paymentRequests?.length) {
    const events = paymentRequests?.map(paymentRequest => ({
      id: uuidv4(),
      name: 'batch-processing-payment-request-invalid',
      type: 'error',
      message: 'Payment request could not be processed',
      data: { paymentRequest }
    }))

    await raiseEventBatch(events, 'error')
  }
}

module.exports = sendPaymentRequestInvalidEvents
