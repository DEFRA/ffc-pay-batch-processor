const blobStorage = require('../blob-storage')
const sendBatchQuarantineEvent = require('../event/send-batch-quarantine-event')

const quarantineFile = async (filename) => {
  console.error(`Quarantining ${filename}, failed to parse file`)
  await sendBatchQuarantineEvent(filename)
  return blobStorage.quarantinePaymentFile(filename, filename)
}

module.exports = quarantineFile
