const { getSchemeFromBatchFileName } = require('ffc-pay-schemes')
const db = require('../database')
const storage = require('../storage')
const processPaymentFile = require('./process-payment-file')

const pollInbound = async () => {
  const transaction = await db.transaction()
  try {
    await db.locks(transaction).where({ lockId: 1 }).forUpdate().first()
    const inboundFiles = await storage.getInboundFileList()

    for (const inboundFile of inboundFiles) {
      const scheme = getSchemeFromBatchFileName(inboundFile)

      if (scheme) {
        console.log(`Identified payment file as scheme: ${scheme.name}`)
        await processPaymentFile(inboundFile, scheme)
      }
    }
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = pollInbound
