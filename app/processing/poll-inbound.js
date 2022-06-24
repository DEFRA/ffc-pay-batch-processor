const storage = require('../storage')
const getScheme = require('./get-scheme')
const processPaymentFile = require('./process-payment-file')

const pollInbound = async () => {
  const paymentFiles = await storage.getInboundFileList()

  if (paymentFiles.length > 0) {
    for (const paymentFile of paymentFiles) {
      const scheme = getScheme(paymentFile)

      if (scheme) {
        console.log(`Identified payment file as scheme: ${scheme.name}`)
        await processPaymentFile(paymentFile, scheme)
      }
    }
  }
}

module.exports = pollInbound
