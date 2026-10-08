jest.mock('../../../../app/processing/batch')

const batch = require('../../../../app/processing/batch')
const routes = require('../../../../app/server/routes/sequence')

describe('sequence routes', () => {
  let server

  beforeEach(async () => {
    const Hapi = require('@hapi/hapi')

    server = Hapi.server()

    server.route(routes)

    jest.clearAllMocks()
  })

  describe('GET /sequence', () => {
    test('returns all sequences', async () => {
      batch.getAllSequences.mockResolvedValue([
        {
          schemeId: 1,
          next: 1
        }
      ])

      const response = await server.inject({
        method: 'GET',
        url: '/sequence'
      })

      expect(response.statusCode).toBe(200)

      expect(batch.getAllSequences).toHaveBeenCalledTimes(1)

      expect(response.result).toEqual({
        sequences: [
          {
            schemeId: 1,
            next: 1
          }
        ]
      })
    })

    test('returns 500 when getAllSequences throws', async () => {
      batch.getAllSequences.mockRejectedValue(
        new Error('database error')
      )

      const response = await server.inject({
        method: 'GET',
        url: '/sequence'
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /update-sequence', () => {
    test('updates sequence number', async () => {
      batch.updateSequence.mockResolvedValue()

      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1,
          next: 25
        }
      })

      expect(response.statusCode).toBe(200)

      expect(batch.updateSequence).toHaveBeenCalledWith(
        1,
        25
      )

      expect(response.result).toEqual({
        schemeId: 1,
        next: 25
      })
    })

    test('returns 400 when schemeId is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          next: 25
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('returns 400 when next is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('returns 400 when next is less than 1', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1,
          next: 0
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('returns 400 when next is greater than 9999', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1,
          next: 10000
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('returns 400 when next is not an integer', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1,
          next: 1.5
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('returns 400 when schemeId is not an integer', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/update-sequence',
        payload: {
          schemeId: 1.5,
          next: 10
        }
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
