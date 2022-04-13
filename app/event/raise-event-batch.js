const { PublishEventBatch } = require('ffc-pay-event-publisher')
const { eventTopic } = require('../config/mq-config')

const raiseEventBatch = async (events, status = 'success') => {
  const eventPublisher = new PublishEventBatch(eventTopic)
  const eventMessages = events.map(event => ({
    name: event.name,
    properties: {
      id: event.id,
      checkpoint: process.env.APPINSIGHTS_CLOUDROLE,
      status,
      action: {
        type: event.type,
        message: event.message,
        data: event.data
      }
    }
  }))

  await eventPublisher.sendEvents(eventMessages)
}

module.exports = raiseEventBatch
