const raiseEventBatch = require('./raise-event-batch')

const sendBatchProcessedEvents = async (filename, paymentRequests, sequence, batchExportDate) => {
  const events = paymentRequests.map(paymentRequest => ({
    id: paymentRequest.correlationId,
    name: 'batch-processing',
    type: 'info',
    message: 'Payment request created from batch file',
    data: { filename, sequence, paymentRequest, batchExportDate }
  }))
  await raiseEventBatch(events)
}

module.exports = sendBatchProcessedEvents
