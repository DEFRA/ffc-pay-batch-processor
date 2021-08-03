const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')

async function sendMessage (body, type, options) {
  const message = createMessage(body, type)
  const sender = new MessageSender(options)
  await sender.sendMessage(message)
  await sender.closeConnection()
}

module.exports = sendMessage
