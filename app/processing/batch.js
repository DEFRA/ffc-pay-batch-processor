const { batches, sequences } = require('../database')

const nextSequenceId = async (schemeId) => {
  const sequence = (await sequences().where({ schemeId }).first()) ?? null
  return sequence?.next
}

const create = async (filename, sequenceNumber, schemeId) => {
  await batches().insert({ filename, sequenceNumber: Number(sequenceNumber), schemeId })
  await sequences().where({ schemeId }).update({ next: Number(sequenceNumber) + 1 })
}

const updateStatus = async (filename, statusId) => {
  const now = new Date()
  await batches().where({ filename }).update({ statusId, processedOn: now, updatedAt: now })
}

const incrementProcessingTries = async (filename) => {
  await batches().where({ filename }).increment('processingTries', 1).update({ updatedAt: new Date() })
}

const exists = async (filename) => {
  return (await batches().where({ filename }).first()) ?? null
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
