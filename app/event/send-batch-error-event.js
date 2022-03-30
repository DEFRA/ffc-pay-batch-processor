const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')

const sendBatchErrorEvent = async (filename, message, error) => {
  const correlationId = uuidv4()
  const event = {
    id: correlationId,
    name: 'batch-processing-error-event',
    type: 'error',
    message,
    data: { filename }
  }
  await raiseEvent(event, 'error', error)
}

module.exports = sendBatchErrorEvent
