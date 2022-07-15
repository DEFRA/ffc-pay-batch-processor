const { v4: uuidv4 } = require('uuid')
const sendBatchProcessedEvent = require('./send-batch-processing-event')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate) => {
  if (paymentRequests?.length) {
    const events = []
    for (const paymentRequest of paymentRequests) {
      try {
        events.push({
          id: uuidv4(),
          name: 'batch-processing',
          type: 'info',
          message: `Payment request could not be processed. Error(s): ${paymentRequest.errorMessage}`,
          data: {
            filename,
            sequence,
            batchExportDate,
            paymentRequest
          }
        })
      } catch {
        console.error('Could not generate batch-processing event for', paymentRequest)
      }
    }

    for (const x of events) {
      await sendBatchProcessedEvent(x)
    }
  }
}

module.exports = sendBatchProcessedEvents
