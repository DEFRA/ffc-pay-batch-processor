const blobStorage = require('../blob-storage')
const sendBatchQuarantineEvent = require('../event/send-batch-quarantine-event')

const quarantineFile = async (filename, error) => {
  console.error(`Quarantining ${filename}, failed to parse file`, error)
  await blobStorage.quarantinePaymentFile(filename, filename)
  await sendBatchQuarantineEvent(filename, error)
}

module.exports = quarantineFile
