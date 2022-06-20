const batches = require('./batches')
const quarantineFile = require('./quarantine-file')

async function fileProcessingFailed (filename) {
  await batches.updateStatus(filename, batches.status.failed)
  await quarantineFile(filename)
}

module.exports = fileProcessingFailed
