const createServer = require('./server')

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)

  const processBatches = require('./process-batches')
  setTimeout(processBatches, 10000)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
