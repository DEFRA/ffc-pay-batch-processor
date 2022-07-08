const { v4: uuidv4 } = require('uuid')
const raiseEventBatch = require('./raise-event-batch')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate) => {
  if (paymentRequests?.length) {
    const events = []
    for (const paymentRequest of paymentRequests) {
      try {
        events.push({
          id: uuidv4(),
          name: 'batch-processing',
          type: 'info',
          message: 'Payment request created from batch file',
          data: {
            filename,
            sequence,
            batchExportDate,
            paymentRequest
          }
        })
      } catch {
        throw (new Error(`Payment request could not be processed: ${paymentRequest}`))
      }
    }
    await raiseEventBatch(events)
  }
}

module.exports = sendBatchProcessedEvents
