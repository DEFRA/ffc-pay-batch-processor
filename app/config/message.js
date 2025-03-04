const Joi = require('joi')

const mqSchema = Joi.object({
  messageQueue: {
    host: Joi.string().default('localhost'),
    useCredentialChain: Joi.bool().default(false),
    type: Joi.string(),
    appInsights: Joi.object(),
    username: Joi.string(),
    password: Joi.string(),
    managedIdentityClientId: Joi.string().optional()
  },
  paymentBatchTopic: {
    address: Joi.string()
  },
  eventTopic: {
    address: Joi.string()
  },
  eventsTopic: {
    address: Joi.string()
  }
})
const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    useCredentialChain: process.env.NODE_ENV === 'production',
    type: 'Topic',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    managedIdentityClientId: process.env.AZURE_CLIENT_ID
  },
  paymentBatchTopic: {
    address: process.env.PAYMENT_TOPIC_ADDRESS
  },
  eventTopic: {
    address: process.env.EVENT_TOPIC_ADDRESS
  },
  eventsTopic: {
    address: process.env.EVENTS_TOPIC_ADDRESS
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
const eventsTopic = { ...mqResult.value.messageQueue, ...mqResult.value.eventsTopic }

module.exports = {
  paymentBatchTopic,
  eventTopic,
  eventsTopic
}
