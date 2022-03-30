const raiseEvent = require('./raise-event')

const sendBatchProcessingEvent = async (paymentRequest) => {
  if (paymentRequest) {
    const correlationId = paymentRequest.correlationId
    const event = {
      id: correlationId,
      name: 'batch-processing-event',
      type: 'info',
      message: 'Payment request parsed from Siti payment file',
      data: paymentRequest
    }
    await raiseEvent(event)
  }
}

module.exports = sendBatchProcessingEvent
