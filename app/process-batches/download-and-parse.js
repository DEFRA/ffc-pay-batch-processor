const blobStorage = require('../blob-storage')
const { parsePaymentFile } = require('../parse-siti-payment-file')
const batches = require('./batches')
const fileProcessingFailed = require('./file-processing-failed')

async function downloadAndParse (filename, schemeType) {
  const buffer = await blobStorage.downloadPaymentFile(filename)
  const parseSuccess = await parsePaymentFile(filename, buffer, schemeType)

  if (parseSuccess) {
    console.log(`Archiving ${filename}, successfully parsed file`)
    await batches.updateStatus(filename, batches.status.success)
    await blobStorage.archivePaymentFile(filename, filename)
  } else {
    console.log(`Quarantining ${filename}, failed to parse file`)
    await fileProcessingFailed(filename)
  }
}

module.exports = downloadAndParse
