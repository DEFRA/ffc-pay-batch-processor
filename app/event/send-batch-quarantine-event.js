const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')
const config = require('../config/processing')
const messageConfig = require('../config/message')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { BATCH_QUARANTINED } = require('../constants/events')

const sendBatchQuarantineEvent = async (filename) => {
  if (config.useV1Events) {
    await sendV1BatchQuarantineEvent(filename)
  }
  if (config.useV2Events) {
    await sendV2BatchQuarantineEvent(filename)
  }
}

const sendV1BatchQuarantineEvent = async (filename) => {
  const event = {
    id: uuidv4(),
    name: 'batch-processing-quarantine-error',
    type: 'error',
    message: `Quarantined ${filename}`,
    data: {
      filename
    }
  }
  await raiseEvent(event, 'error')
}

const sendV2BatchQuarantineEvent = async (filename) => {
  const event = {
    source: SOURCE,
    type: BATCH_QUARANTINED,
    subject: filename,
    data: {
      message: 'Batch quarantined',
      filename
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendBatchQuarantineEvent
