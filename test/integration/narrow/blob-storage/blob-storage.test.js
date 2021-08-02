describe('Blob storage tests', () => {
  const createServer = require('../../../../app/server')
  let server
  const blobStorage = require('../../../../app/blob-storage')
  const blobStorageConfig = require('../../../../app/config/blob-storage')
  const mockFileList = ['test1.txt', 'test2.txt']
  const testFileContents = 'This is a test file'

  async function getContainer (containerName) {
    const container = blobStorage.blobServiceClient.getContainerClient(containerName)
    await container.createIfNotExists()
    return container
  }

  beforeEach(async () => {
    server = await createServer()
    await server.start()

    // Set up the inbound container so it contains files needed for testing blob storage behaviour
    const inboundContainer = await getContainer(blobStorageConfig.inboundContainer)

    for (const filename of mockFileList) {
      const blob = inboundContainer.getBlockBlobClient(filename)
      const buffer = Buffer.from(testFileContents)
      await blob.upload(buffer, buffer.byteLength)
    }
  })

  // archivePaymentFile

  test('List files in inbound blob container', async () => {
    const fileList = await blobStorage.getInboundFileList()
    expect(fileList).toEqual(expect.arrayContaining(mockFileList))
  })

  test('Get file details from blob container', async () => {
    const fileDetails = await blobStorage.getInboundFileDetails(mockFileList[0])
    expect(fileDetails._response.status).toEqual(200)
  })

  test('Download blob into buffer from blob container', async () => {
    const buffer = await blobStorage.downloadPaymentFile(mockFileList[0])
    const bufferContent = buffer.toString()

    expect(buffer).toBeInstanceOf(Buffer)
    expect(bufferContent).toEqual(testFileContents)
  })

  test('Copy blob from inbound to archive container', async () => {
    const result = await blobStorage.archivePaymentFile(mockFileList[0], mockFileList[0])
    const fileList = await blobStorage.getInboundFileList()

    expect(result).toEqual(true)
    expect(fileList.length).toEqual(mockFileList.length - 1)
  })

  afterEach(async () => {
    const deleteBlobs = async (containerName) => {
      const container = await getContainer(containerName)

      for (const filename of mockFileList) {
        const blob = container.getBlockBlobClient(filename)
        await blob.deleteIfExists()
      }
    }

    await deleteBlobs(blobStorageConfig.inboundContainer)
    await deleteBlobs(blobStorageConfig.archiveContainer)
    await server.stop()
  })
})
