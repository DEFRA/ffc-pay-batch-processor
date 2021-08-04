const { MessageBulkSender } = require('ffc-messaging')
const createMessage = require('./create-message')

async function sendBatchMessage (body, type, options) {
  const messages = body.map(message => createMessage(message, type))
  const sender = new MessageBulkSender(options)
  await sender.sendBatchMessages(messages)
  await sender.closeConnection()
}

module.exports = sendBatchMessage
