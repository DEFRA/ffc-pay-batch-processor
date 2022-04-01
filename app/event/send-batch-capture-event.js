const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('../event/raise-event')

const sendBatchCaptureEvent = async (correlation) => {
  const event = {
    id: uuidv4(),
    name: 'batch-processing-capture',
    type: 'info',
    message: 'Correlation for payment request within Siti payment file',
    data: correlation
  }
  await raiseEvent(event)
}

module.exports = sendBatchCaptureEvent
