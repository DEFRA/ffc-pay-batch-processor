const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')

const sendBatchQuarantineEvent = async (filename, error) => {
  const event = {
    id: uuidv4(),
    name: 'batch-processing-quarantine-error',
    type: 'error',
    message: `Quarantined ${filename}`,
    data: {
      filename,
      error
    }
  }
  await raiseEvent(event, 'error')
}

module.exports = sendBatchQuarantineEvent
