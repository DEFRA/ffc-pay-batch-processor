const blobStorage = require('../storage')
const sendResponsesQuarantineEvent = require('../event/send-responses-quarantine-event')

const quarantineFile = async (filename, error) => {
  console.error(`Quarantining ${filename}, failed to parse file`, error)
  await blobStorage.quarantineFile(filename, filename)
  await sendResponsesQuarantineEvent(filename, error)
}

module.exports = quarantineFile
