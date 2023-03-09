const { EventPublisher } = require('ffc-pay-event-publisher')
const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const sendBatchProcessedEvent = require('./send-batch-processing-event')

const sendBatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate, scheme) => {
  if (config.useV1Events) {
    await sendV1BatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate)
  }
  if (config.useV2Events) {
    await sendV2BatchProcessedEvents(paymentRequests, filename, sequence, batchExportDate, scheme)
  }
}

const sendV1BatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate) => {
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

const sendV2BatchProcessedEvents = async (paymentRequests, filename, sequence, batchExportDate, scheme) => {
  if (paymentRequests.length) {
    const events = paymentRequests.map(paymentRequest => createEvent(paymentRequest, filename, scheme))
    const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
    await eventPublisher.publishEvents(events)
  }
}

const createEvent = (paymentRequest, filename, scheme) => {
  return {
    source: 'ffc-pay-batch-processor',
    type: 'uk.gov.defra.ffc.pay.payment.extracted',
    subject: filename,
    data: {
      schemeId: scheme.schemeId,
      ...paymentRequest
    }
  }
}

module.exports = sendBatchProcessedEvents
