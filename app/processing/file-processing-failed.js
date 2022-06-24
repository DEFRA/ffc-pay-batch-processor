const batch = require('./batch')
const storage = require('../storage')

const fileProcessingFailed = async (filename) => {
  await batch.updateStatus(filename, batch.status.failed)
  await storage.quarantinePaymentFile(filename, filename)
}

module.exports = fileProcessingFailed
