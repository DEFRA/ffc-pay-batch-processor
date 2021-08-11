const db = require('../data')
const schemeDetails = require('../scheme-details')

async function nextSequenceId (schemeIdentifier) {
  const dbSchemeId = schemeDetails.getDbIdentifier(schemeIdentifier)
  if (!dbSchemeId) { return undefined }

  const batches = await db.batch.findAll({
    where: { schemeId: dbSchemeId }
  })

  if (batches.length === 0) { return 1 }

  const highestSequenceNumber = batches.reduce((pre, cur) => Math.max(pre, cur.sequenceNumber), 0)
  return highestSequenceNumber + 1
}

function create (filename, sequenceNumber, schemeIdentifier) {
  const schemeId = schemeDetails.getDbIdentifier(schemeIdentifier)
  db.batch.create({ filename, sequenceNumber: Number(sequenceNumber), schemeId })
}

function updateStatus (filename, statusId) {
  db.batch.update({ statusId, processedOn: Date.now() }, { where: { filename } })
}

function incrementProcessingTries (filename) {
  db.batch.increment('processingTries', { by: 1, where: { filename } })
}

function exists (filename) {
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
