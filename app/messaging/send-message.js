const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')

async function sendMessage (body, type, correlationId, options) {
  const message = createMessage(body, type, correlationId)
  const sender = new MessageSender(options)
  await sender.sendMessage(message)
  await sender.closeConnection()
}

module.exports = sendMessage
