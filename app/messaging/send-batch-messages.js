const Joi = require('joi')
const createMessage = require('./create-message')
const sendMessages = require('./send-message')

const sendBatchMessages = async (body, type, options) => {
  if (body?.length) {
    const messages = []
    for (const item of body) {
      try {
        const isObject = Joi.object().required().validate(item)
        if (isObject.error) { throw (new Error()) }

        messages.push(createMessage(item, type))
      } catch {
        console.error('Could not create message for', item)
      }
    }

    await sendMessages(messages, options)
  }
}

module.exports = sendBatchMessages
