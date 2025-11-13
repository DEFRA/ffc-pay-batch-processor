const Hapi = require('@hapi/hapi')
const Boom = require('@hapi/boom')
const plugin = require('../../../../app/server/plugins/errors').plugin

describe('Errors Plugin', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await server.register(plugin)

    // Define error routes
    const routes = [
      {
        path: '/regular-error',
        error: new Error('Regular test error'),
        statusCode: 500
      },
      {
        path: '/boom-error',
        error: Boom.badRequest('Hapi Boom test error'),
        statusCode: 400
      }
    ]

    routes.forEach(({ path, error }) => {
      server.route({
        method: 'GET',
        path,
        handler: () => { throw error }
      })
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    { path: '/regular-error', expectedStatus: 500, expectedMessage: 'Regular test error' },
    { path: '/boom-error', expectedStatus: 400, expectedMessage: 'Hapi Boom test error' }
  ])('logs errors correctly for $path', async ({ path, expectedStatus, expectedMessage }) => {
    const requestLogSpy = jest.fn()

    server.ext('onRequest', (request, h) => {
      request.log = requestLogSpy
      return h.continue
    })

    const response = await server.inject({ method: 'GET', url: path })

    expect(response.statusCode).toBe(expectedStatus)
    expect(requestLogSpy).toHaveBeenCalledWith('error', expect.objectContaining({
      statusCode: expectedStatus,
      message: expectedMessage,
      payloadMessage: ''
    }))
  })
})
