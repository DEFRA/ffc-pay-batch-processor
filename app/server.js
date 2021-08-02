const Hapi = require('@hapi/hapi')

async function createServer () {
  const server = Hapi.server({
    port: process.env.PORT
  })

  const routes = [].concat(
    require('./routes/healthy'),
    require('./routes/healthz')
  )

  server.route(routes)

  return server
}

module.exports = createServer
