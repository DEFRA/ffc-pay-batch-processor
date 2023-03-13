const storage = require('../storage')
const parsePaymentFile = require('./parse-payment-file')
const batch = require('./batch')
const fileProcessingFailed = require('./file-processing-failed')
const { sendBatchSuccessEvent } = require('../event')

const downloadAndParse = async (filename, scheme, sequence) => {
  const buffer = await storage.downloadPaymentFile(filename)
  const parseSuccess = await parsePaymentFile(filename, buffer, scheme, sequence)

  if (parseSuccess) {
    console.log(`Archiving ${filename}, successfully parsed file`)
    await batch.updateStatus(filename, batch.status.success)
    await storage.archivePaymentFile(filename, filename)
    await sendBatchSuccessEvent(filename)
  } else {
    console.log(`Quarantining ${filename}, failed to parse file`)
    await fileProcessingFailed(filename)
  }
}

module.exports = downloadAndParse
