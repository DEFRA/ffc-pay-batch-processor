const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const batch = require('../../../app/processing/batch')

const filename = 'SITISFI0001_AP_1.dat'

describe('batch', () => {
  beforeEach(async () => {
    await truncate()
    await db.schemes().insert({ schemeId: 1, scheme: 'SFI' })
    await db.sequences().insert({ schemeId: 1, next: 1 })
    await db.statuses().insert([
      { statusId: 1, status: 'In progress' },
      { statusId: 2, status: 'Success' },
      { statusId: 3, status: 'Failed' }
    ])
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('nextSequenceId returns the scheme sequence, or undefined when there is none', async () => {
    await expect(batch.nextSequenceId(1)).resolves.toBe(1)
    await expect(batch.nextSequenceId(99)).resolves.toBeUndefined()
  })

  test('create inserts the batch and advances the sequence', async () => {
    await batch.create(filename, '0001', 1)

    const saved = await batch.exists(filename)
    expect(saved).toMatchObject({ filename, sequenceNumber: 1, schemeId: 1, statusId: 1, processingTries: 1 })
    expect(saved.createdAt).toBeInstanceOf(Date)
    await expect(batch.nextSequenceId(1)).resolves.toBe(2)
  })

  test('exists returns null when the batch is not found', async () => {
    await expect(batch.exists('missing.dat')).resolves.toBeNull()
  })

  test('updateStatus sets the status, processedOn and updatedAt', async () => {
    await batch.create(filename, '0001', 1)
    const before = await batch.exists(filename)

    await batch.updateStatus(filename, batch.status.success)

    const after = await batch.exists(filename)
    expect(after.statusId).toBe(batch.status.success)
    expect(after.processedOn).toBeInstanceOf(Date)
    expect(after.updatedAt.getTime()).toBeGreaterThanOrEqual(before.updatedAt.getTime())
  })

  test('incrementProcessingTries adds one to the tries and sets updatedAt', async () => {
    const staleDate = new Date('2020-01-01T00:00:00Z')
    await batch.create(filename, '0001', 1)
    await db.batches().where({ filename }).update({ updatedAt: staleDate })

    await batch.incrementProcessingTries(filename)

    const saved = await batch.exists(filename)
    expect(saved.processingTries).toBe(2)
    expect(saved.updatedAt.getTime()).toBeGreaterThan(staleDate.getTime())
  })

  test('the lock row can be selected FOR UPDATE inside a transaction', async () => {
    await db.locks().insert({ lockId: 1 })
    const trx = await db.transaction()

    const lock = await db.locks(trx).where({ lockId: 1 }).forUpdate().first()

    expect(lock).toEqual({ lockId: 1 })
    await trx.commit()
  })
})
