const batch = require('./batch')
const quarantineFile = require('./quarantine-file')

const fileProcessingFailed = async (filename) => {
  await batch.updateStatus(filename, batch.status.failed)
  await quarantineFile(filename)
}

module.exports = fileProcessingFailed
