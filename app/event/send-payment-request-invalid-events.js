const { EventPublisher } = require('ffc-pay-event-publisher')
const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const sendPaymentRequestInvalidEvent = require('./send-payment-request-invalid-event')

const sendPaymentRequestInvalidEvents = async (paymentRequests) => {
  if (config.useV1Events) {
    await sendV1PaymentRequestInvalidEvents(paymentRequests)
  }
  if (config.useV2Events) {
    await sendV2PaymentRequestInvalidEvents(paymentRequests)
  }
}

const sendV1PaymentRequestInvalidEvents = async (paymentRequests) => {
  if (paymentRequests?.length) {
    const events = []
    for (const paymentRequest of paymentRequests) {
      try {
        const isObject = Joi.object().required().validate(paymentRequest)
        if (isObject.error) { throw (new Error()) }

        events.push({
          id: uuidv4(),
          name: 'batch-processing-payment-request-invalid',
          type: 'error',
          message: `Payment request could not be processed. Error(s): ${paymentRequest.errorMessage}`,
          data: { paymentRequest }
        })
      } catch {
        console.error('Could not generate batch-processing-payment-request-invalid event for', paymentRequest)
      }
    }

    for (const x of events) {
      await sendPaymentRequestInvalidEvent(x)
    }
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
    source: 'ffc-pay-batch-processor',
    type: 'uk.gov.defra.ffc.pay.warning.payment.rejected',
    data: {
      message: paymentRequest.errorMessage,
      ...paymentRequest
    }
  }
}

module.exports = sendPaymentRequestInvalidEvents
