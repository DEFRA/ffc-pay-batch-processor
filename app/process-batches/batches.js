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

async function create (filename, sequenceNumber, schemeIdentifier) {
  const schemeId = schemeDetails.getDbIdentifier(schemeIdentifier)
  await db.batch.create({ filename, sequenceNumber: Number(sequenceNumber), schemeId })
}

async function updateStatus (filename, statusId) {
  await db.batch.update({ statusId }, { where: { filename } })
}

module.exports = {
  nextSequenceId,
  create,
  updateStatus,
  status: {
    inProgress: 1,
    success: 2,
    failed: 3
  }
}
