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

  try {
    console.log('Try first time')
    await createBatch()
  } catch (err) {
    console.log('Failed, wait a bit')
    await new Promise(resolve => setTimeout(resolve, 10000))
    console.log('Try second time')
    createBatch()
  }

  // require('./process-batches')()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
