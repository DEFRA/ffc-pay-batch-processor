const createServer = require('./server')

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)

  setTimeout(require('./process-batches'), 30000)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
