const storage = require('../storage')
const getSchemeFromFilename = require('./get-scheme-from-filename')
const processPaymentFile = require('./process-payment-file')

const pollInbound = async () => {
  const inboundFiles = await storage.getInboundFileList()

  for (const inboundFile of inboundFiles) {
    const scheme = getSchemeFromFilename(inboundFile)

    if (scheme) {
      console.log(`Identified payment file as scheme: ${scheme.name}`)
      await processPaymentFile(inboundFile, scheme)
    }
  }
}

module.exports = pollInbound
