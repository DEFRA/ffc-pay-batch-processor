const messageConfig = require('../config/message')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { PAYMENT_EXTRACTED } = require('../constants/events')

const sendBatchProcessedEvents = async (paymentRequests, filename, scheme) => {
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
