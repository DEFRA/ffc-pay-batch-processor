const db = require('../data')

const nextSequenceId = async (schemeId) => {
  const sequence = await db.sequence.findOne({ where: { schemeId } })
  return sequence?.next
}

const create = async (filename, sequenceNumber, schemeId) => {
  await db.batch.create({ filename, sequenceNumber: Number(sequenceNumber), schemeId })
  await db.sequence.update({ next: Number(sequenceNumber) + 1 }, { where: { schemeId } })
}

const updateStatus = async (filename, statusId) => {
  await db.batch.update({ statusId, processedOn: Date.now() }, { where: { filename } })
}

const incrementProcessingTries = async (filename) => {
  await db.batch.increment('processingTries', { by: 1, where: { filename } })
}

const exists = async (filename) => {
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
