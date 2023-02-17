const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')
const config = require('../config/processing')
const { EventPublisher } = require('ffc-pay-event-publisher')

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
    source: 'ffc-pay-batch-processor',
    type: 'uk.gov.defra.ffc.pay.warning.batch.quarantined',
    subject: filename,
    data: {
      message: 'File quarantined',
      filename
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendBatchQuarantineEvent
