const raiseEvent = require('./raise-event')

const sendBatchProcessedEvent = async (filename, paymentRequest, sequence) => {
  if (paymentRequest) {
    const correlationId = paymentRequest.correlationId
    const event = {
      id: correlationId,
      name: 'batch-processing',
      type: 'info',
      message: 'Payment request created from batch file',
      data: { filename, sequence, paymentRequest }
    }
    await raiseEvent(event)
  }
}

module.exports = sendBatchProcessedEvent
