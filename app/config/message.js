const joi = require('joi')

const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost'),
    useCredentialChain: joi.bool().default(false),
    type: joi.string(),
    appInsights: joi.object(),
    username: joi.string(),
    password: joi.string()
  },
  paymentBatchTopic: {
    address: joi.string()
  },
  eventTopic: {
    address: joi.string()
  }
})
const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    useCredentialChain: process.env.NODE_ENV === 'production',
    type: 'Topic',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD
  },
  paymentBatchTopic: {
    address: process.env.PAYMENT_TOPIC_ADDRESS
  },
  eventTopic: {
    address: process.env.EVENT_TOPIC_ADDRESS
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const paymentBatchTopic = { ...mqResult.value.messageQueue, ...mqResult.value.paymentBatchTopic }
const eventTopic = { ...mqResult.value.messageQueue, ...mqResult.value.eventTopic }

module.exports = {
  paymentBatchTopic,
  eventTopic
}
