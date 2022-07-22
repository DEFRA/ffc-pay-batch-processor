const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const sendBatchProcessedEvent = require('./send-batch-processing-event')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate) => {
  if (paymentRequests?.length) {
    const events = []
    for (const paymentRequest of paymentRequests) {
      try {
        const isObject = Joi.object().required().validate(paymentRequest)
        if (isObject.error) { throw (new Error()) }

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
        console.error('Could not generate batch-processing event for', paymentRequest)
      }
    }

    for (const x of events) {
      await sendBatchProcessedEvent(x)
    }
  }
}

module.exports = sendBatchProcessedEvents
