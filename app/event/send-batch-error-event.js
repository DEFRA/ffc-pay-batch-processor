const { EventPublisher } = require('ffc-pay-event-publisher')
const { v4: uuidv4 } = require('uuid')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const raiseEvent = require('./raise-event')

const sendBatchErrorEvent = async (filename, error) => {
  if (config.useV1Events) {
    await sendV1BatchErrorEvent(filename, error)
  }
  if (config.useV2Events) {
    await sendV2BatchErrorEvent(filename, error)
  }
}

const sendV1BatchErrorEvent = async (filename, error) => {
  const correlationId = uuidv4()
  const event = {
    id: correlationId,
    name: 'batch-processing-error',
    type: 'error',
    message: error.message,
    data: { filename }
  }
  await raiseEvent(event, 'error')
}

const sendV2BatchErrorEvent = async (filename, error) => {
  const event = {
    source: 'ffc-pay-batch-processor',
    type: 'uk.gov.defra.ffc.pay.warning.batch.rejected',
    subject: filename,
    data: {
      message: error.message,
      filename
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendBatchErrorEvent
