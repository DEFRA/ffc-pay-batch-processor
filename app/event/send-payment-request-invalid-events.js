const util = require('util')
const { EventPublisher } = require('ffc-pay-event-publisher')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const { SOURCE } = require('../constants/source')
const { PAYMENT_REJECTED } = require('../constants/events')

const sendPaymentRequestInvalidEvents = async (paymentRequests) => {
  console.log('Publishing events for invalid payment requests', util.inspect(paymentRequests, false, null, true))
  if (config.useV2Events) {
    await sendV2PaymentRequestInvalidEvents(paymentRequests)
  }
}

const sendV2PaymentRequestInvalidEvents = async (paymentRequests) => {
  if (paymentRequests?.length) {
    const events = paymentRequests.map(createEvent)
    const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
    await eventPublisher.publishEvents(events)
  }
}

const createEvent = (paymentRequest) => {
  return {
    source: SOURCE,
    type: PAYMENT_REJECTED,
    data: {
      message: paymentRequest.errorMessage,
      ...paymentRequest
    }
  }
}

module.exports = sendPaymentRequestInvalidEvents
