const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('./raise-event')

const sendBatchErrorEvent = async (filename, error) => {
  const correlationId = uuidv4()
  const event = {
    id: correlationId,
    name: 'batch-processing-error',
    type: 'error',
    message: error.message,
    data: { filename }
  }
  await raiseEvent(event, 'error')
}

module.exports = sendBatchErrorEvent
