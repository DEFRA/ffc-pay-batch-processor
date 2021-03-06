const { PublishEvent } = require('ffc-pay-event-publisher')
const { eventTopic } = require('../config/message')

const raiseEvent = async (event, status = 'success') => {
  const eventPublisher = new PublishEvent(eventTopic)

  const eventMessage = {
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
  }
  await eventPublisher.sendEvent(eventMessage)
}

module.exports = raiseEvent
