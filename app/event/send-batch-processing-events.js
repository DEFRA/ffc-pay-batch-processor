const { v4: uuidv4 } = require('uuid')
const raiseEventBatch = require('./raise-event-batch')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate) => {
  if (paymentRequests?.length) {
    const events = paymentRequests?.map(paymentRequest => ({
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
    }))
    await raiseEventBatch(events)
  }
}

module.exports = sendBatchProcessedEvents
