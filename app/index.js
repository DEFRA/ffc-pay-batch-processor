const createServer = require('./server')

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)

  const createBatch = async () => {
    const db = require('./data')
    await db.batch.create({ filename: 'testmcfile', sequenceNumber: 33, schemeId: 1 })
    console.info('created batch')
  }

  setTimeout(createBatch, 60000)

  // require('./process-batches')()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
