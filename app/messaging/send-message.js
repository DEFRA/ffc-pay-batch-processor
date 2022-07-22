const { MessageBatchSender } = require('ffc-messaging')

const sendMessages = async (messages, options) => {
  let sender

  try {
    sender = new MessageBatchSender(options)
    await sender.sendBatchMessages(messages)
  } catch (error) {
    console.error('Could not send messages for', messages, error)
  } finally {
    if (sender !== undefined) {
      await sender.closeConnection()
    }
  }
}

module.exports = sendMessages
