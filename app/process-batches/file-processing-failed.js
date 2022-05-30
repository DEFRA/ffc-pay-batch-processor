const batches = require('./batches')
const blobStorage = require('../blob-storage')

async function fileProcessingFailed (filename) {
  await batches.updateStatus(filename, batches.status.failed)
  await blobStorage.quarantinePaymentFile(filename, filename)
}

module.exports = fileProcessingFailed
