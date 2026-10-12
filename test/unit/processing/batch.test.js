jest.mock('../../../app/data')

const db = require('../../../app/data')

const {
  getAllSequences,
  updateSequence
} = require('../../../app/processing/batch')

describe('batch', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    db.sequence = {
      findAll: jest.fn(),
      update: jest.fn()
    }

    db.scheme = {}
  })

  describe('getAllSequences', () => {
    test('gets all sequences ordered by schemeId', async () => {
      const sequences = [
        {
          schemeId: 1,
          next: 1
        }
      ]

      db.sequence.findAll.mockResolvedValue(sequences)

      const result = await getAllSequences()

      expect(db.sequence.findAll).toHaveBeenCalledWith({
        include: [{
          model: db.scheme,
          as: 'scheme',
          attributes: ['scheme']
        }],
        order: [['schemeId', 'ASC']]
      })

      expect(result).toEqual(sequences)
    })

    test('throws when findAll fails', async () => {
      const error = new Error('database error')

      db.sequence.findAll.mockRejectedValue(error)

      await expect(getAllSequences())
        .rejects
        .toThrow('database error')
    })
  })

  describe('updateSequence', () => {
    test('updates sequence number for scheme', async () => {
      db.sequence.update.mockResolvedValue([1])

      const result = await updateSequence(5, 123)

      expect(db.sequence.update).toHaveBeenCalledWith(
        { next: 123 },
        {
          where: {
            schemeId: 5
          }
        }
      )

      expect(result).toEqual([1])
    })

    test('throws when update fails', async () => {
      const error = new Error('database error')

      db.sequence.update.mockRejectedValue(error)

      await expect(updateSequence(5, 123))
        .rejects
        .toThrow('database error')
    })
  })
})
