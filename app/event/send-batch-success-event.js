const config = require('../config/processing')
const messageConfig = require('../config/message')
const { EventPublisher } = require('ffc-pay-event-publisher')

const sendBatchSuccessEvent = async (filename) => {
  if (config.useV2Events) {
    await sendV2BatchSuccessEvent(filename)
  }
}

const sendV2BatchSuccessEvent = async (filename) => {
  const event = {
    source: 'ffc-pay-batch-processor',
    type: 'uk.gov.defra.ffc.pay.batch.processed.siti-agri',
    subject: filename,
    data: {
      filename
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendBatchSuccessEvent
