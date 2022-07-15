const raiseEvent = require('./raise-event')

const sendBatchProcessedEvent = async (paymentRequest) => {
  try {
    await raiseEvent(paymentRequest, 'error')
  } catch {
    console.error('Could not send batch-processing event for', paymentRequest)
  }
}

module.exports = sendBatchProcessedEvent
