const storage = require('../storage')
const parsePaymentFile = require('./parse-payment-file')
const batch = require('./batch')
const fileProcessingFailed = require('./file-processing-failed')
const { sendBatchSuccessEvent, sendBatchErrorEvent } = require('../event')

const downloadAndParse = async (filename, scheme) => {
  const buffer = await storage.downloadPaymentFile(filename)
  const parseSuccess = await parsePaymentFile(filename, buffer, scheme)

  if (parseSuccess) {
    console.log(`Archiving ${filename}, successfully parsed file`)
    try {
      await sendBatchSuccessEvent(filename)
    } catch (err) {
      console.error(`Failed to send batch success event for ${filename}:`, err)

      if (typeof sendBatchErrorEvent === 'function') {
        await sendBatchErrorEvent(filename, err)
      }

      await fileProcessingFailed(filename)
      return
    }
    await batch.updateStatus(filename, batch.status.success)
    await storage.archivePaymentFile(filename, filename)
  } else {
    console.log(`Quarantining ${filename}, failed to parse file`)
    await fileProcessingFailed(filename)
  }
}

module.exports = downloadAndParse
