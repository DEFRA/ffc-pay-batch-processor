const sendBatchProcessedEvents = require('./send-batch-processing-events')
const sendBatchErrorEvent = require('./send-batch-error-event')

module.exports = {
  sendBatchProcessedEvents,
  sendBatchErrorEvent
}
