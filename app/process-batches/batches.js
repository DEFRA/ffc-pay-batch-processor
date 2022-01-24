const db = require('../data')
const schemeDetails = require('../scheme-details')

async function nextSequenceId (schemeName) {
  const schemeId = await schemeDetails.getDbIdentifier(schemeName)
  if (!schemeId) { return undefined }

  const sequence = await db.sequence.findOne({ where: { schemeId } })
  return sequence?.next
}

async function create (filename, sequenceNumber, schemeName) {
  const schemeId = await schemeDetails.getDbIdentifier(schemeName)
  await db.batch.create({ filename, sequenceNumber: Number(sequenceNumber), schemeId })
  await db.sequence.update({ next: Number(sequenceNumber) + 1 }, { where: { schemeId } })
}

async function updateStatus (filename, statusId) {
  await db.batch.update({ statusId, processedOn: Date.now() }, { where: { filename } })
}

async function incrementProcessingTries (filename) {
  await db.batch.increment('processingTries', { by: 1, where: { filename } })
}

async function exists (filename) {
  return db.batch.findOne({ where: { filename } })
}

module.exports = {
  nextSequenceId,
  create,
  updateStatus,
  exists,
  incrementProcessingTries,
  status: {
    inProgress: 1,
    success: 2,
    failed: 3
  }
}
