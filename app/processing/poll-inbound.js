const db = require('../data')
const storage = require('../storage')
const getSchemeFromFilename = require('./get-scheme-from-filename')
const processPaymentFile = require('./process-payment-file')

const pollInbound = async () => {
  const transaction = await db.sequelize.transaction()
  try {
    await db.lock.findByPk(1, { transaction, lock: true })
    const inboundFiles = await storage.getInboundFileList()

    for (const inboundFile of inboundFiles) {
      const scheme = getSchemeFromFilename(inboundFile)

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
