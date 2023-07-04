const { fc } = require('../constants/schemes')
const db = require('../data')
const storage = require('../storage')
const getSchemeFromFilename = require('./get-scheme-from-filename')
const { findGlosControlFile } = require('./glos/find-glos-control-file')
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
        if (scheme === fc) {
          await findGlosControlFile(inboundFile)
        }
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
