const { getSender } = require('./service-bus/sender-cache')
const { sendBatchMessages } = require('./service-bus/send-batch-messages')

const sendMessages = async (messages, config) => {
  try {
    const sender = getSender(config)
    await sendBatchMessages(sender, messages)
  } catch (error) {
    console.error('Could not send messages for', messages, error)
  }
}

module.exports = sendMessages
