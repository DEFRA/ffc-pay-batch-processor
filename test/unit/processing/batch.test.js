const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['batches', 'sequences'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const batch = require('../../../app/processing/batch')

const filename = 'SITISFI0001_AP_1.dat'

describe('batch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves(undefined)
  })

  describe('nextSequenceId', () => {
    test('returns the next sequence for the scheme', async () => {
      mockDb.builder.resolves({ schemeId: 1, next: 5 })

      const result = await batch.nextSequenceId(1)

      expect(result).toBe(5)
      expect(mockDb.tables.sequences).toHaveBeenCalledTimes(1)
      expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: 1 })
      expect(mockDb.builder.first).toHaveBeenCalledTimes(1)
    })

    test('returns undefined when there is no sequence', async () => {
      const result = await batch.nextSequenceId(1)

      expect(result).toBeUndefined()
    })
  })

  describe('create', () => {
    test('inserts the batch with a numeric sequence number', async () => {
      await batch.create(filename, '0001', 1)

      expect(mockDb.tables.batches).toHaveBeenCalledTimes(1)
      expect(mockDb.builder.insert).toHaveBeenCalledWith({
        filename,
        sequenceNumber: 1,
        schemeId: 1
      })
    })

    test('increments the scheme sequence', async () => {
      await batch.create(filename, '0004', 2)

      expect(mockDb.tables.sequences).toHaveBeenCalledTimes(1)
      expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: 2 })
      expect(mockDb.builder.update).toHaveBeenCalledWith({ next: 5 })
    })

    test('rejects when the insert fails', async () => {
      const error = new Error('DB error')
      mockDb.builder.rejects(error)

      await expect(batch.create(filename, '0001', 1)).rejects.toBe(error)
    })
  })

  describe('updateStatus', () => {
    test('sets the status, processed and updated dates', async () => {
      await batch.updateStatus(filename, batch.status.success)

      expect(mockDb.builder.where).toHaveBeenCalledWith({ filename })
      expect(mockDb.builder.update).toHaveBeenCalledWith({
        statusId: batch.status.success,
        processedOn: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('incrementProcessingTries', () => {
    test('increments processing tries and sets updated date for the file', async () => {
      await batch.incrementProcessingTries(filename)

      expect(mockDb.builder.where).toHaveBeenCalledWith({ filename })
      expect(mockDb.builder.increment).toHaveBeenCalledWith('processingTries', 1)
      expect(mockDb.builder.update).toHaveBeenCalledWith({ updatedAt: expect.any(Date) })
    })
  })

  describe('exists', () => {
    test('returns the batch when found', async () => {
      const row = { batchId: 1, filename }
      mockDb.builder.resolves(row)

      await expect(batch.exists(filename)).resolves.toBe(row)
      expect(mockDb.builder.where).toHaveBeenCalledWith({ filename })
    })

    test('returns null when not found', async () => {
      await expect(batch.exists(filename)).resolves.toBeNull()
    })
  })

  test('exposes the batch statuses', () => {
    expect(batch.status).toEqual({ inProgress: 1, success: 2, failed: 3 })
  })
})
