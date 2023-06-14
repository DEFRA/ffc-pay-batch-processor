const { EventPublisher } = require('ffc-pay-event-publisher')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const { SOURCE } = require('../constants/source')
const { PAYMENT_EXTRACTED } = require('../constants/events')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate, scheme) => {
  if (config.useV2Events) {
    await sendV2BatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
  }
}

const sendV2BatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate, scheme) => {
  if (paymentRequests.length) {
    const events = paymentRequests.map(paymentRequest => createEvent(paymentRequest, filename, scheme))
    const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
    await eventPublisher.publishEvents(events)
  }
}

const createEvent = (paymentRequest, filename, scheme) => {
  return {
    source: SOURCE,
    type: PAYMENT_EXTRACTED,
    subject: filename,
    data: {
      schemeId: scheme.schemeId,
      ...paymentRequest
    }
  }
}

module.exports = sendBatchProcessedEvents
