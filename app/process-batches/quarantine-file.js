const blobStorage = require('../blob-storage')
const sendBatchQuarantineEvent = require('../event/send-batch-quarantine-event')

const quarantineFile = async (filename, error) => {
  console.error(`Quarantining ${filename}, failed to parse file`, error)
  await sendBatchQuarantineEvent(filename, error)
  return blobStorage.quarantinePaymentFile(filename, filename)
}

module.exports = quarantineFile
