const { MessageBatchSender } = require('ffc-messaging')
const createMessage = require('./create-message')

const sendBatchMessage = async (body, type, options) => {
  const messages = body.map(message => createMessage(message, type))
  const sender = new MessageBatchSender(options)
  await sender.sendBatchMessages(messages)
  await sender.closeConnection()
}

module.exports = sendBatchMessage
