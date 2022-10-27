const storage = require('../storage')
const sendBatchQuarantineEvent = require('../event/send-batch-quarantine-event')

const quarantineFile = async (filename) => {
  await sendBatchQuarantineEvent(filename)
  return storage.quarantinePaymentFile(filename, filename)
}

module.exports = quarantineFile
