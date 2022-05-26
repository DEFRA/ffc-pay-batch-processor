const { PublishEvent } = require('ffc-pay-event-publisher')
const { eventTopic } = require('../config/mq-config')

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
  const size = Buffer.byteLength(JSON.stringify(eventMessage))
  const kiloBytes = size / 1024
  const megaBytes = kiloBytes / 1024
  console.log(`Size: ${size}, KB: ${kiloBytes}, MB: ${megaBytes}`)
  await eventPublisher.sendEvent(eventMessage)
}

module.exports = raiseEvent
