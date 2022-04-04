const { v4: uuidv4 } = require('uuid')
const raiseEvent = require('../event/raise-event')

const sendBatchCapturedEvent = async (correlation) => {
  const event = {
    id: uuidv4(),
    name: 'batch-processing-captured',
    type: 'info',
    message: 'Correlation Ids allocated for payment requests',
    data: correlation
  }
  await raiseEvent(event)
}

module.exports = sendBatchCapturedEvent
