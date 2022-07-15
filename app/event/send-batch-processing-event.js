const raiseEvent = require('./raise-event')

const sendBatchProcessedEvent = async (paymentRequest) => {
  try {
    await raiseEvent(paymentRequest)
  } catch {
    console.error('Could not send batch-processing event for', paymentRequest)
  }
}

module.exports = sendBatchProcessedEvent
