const messageConfig = require('../config/message')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { BATCH_REJECTED } = require('../constants/events')

const sendBatchErrorEvent = async (filename, error) => {
  const event = {
    source: SOURCE,
    type: BATCH_REJECTED,
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
