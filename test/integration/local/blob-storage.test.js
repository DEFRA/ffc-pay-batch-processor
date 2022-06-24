describe('Blob storage tests', () => {
  let blobServiceClient
  let container
  let server
  const { BlobServiceClient } = require('@azure/storage-blob')
  const blobStorage = require('../../../app/storage')
  const blobStorageConfig = require('../../../app/config/storage')
  const mockFileList = ['test1.dat', 'test2.dat']
  const testFileContents = 'This is a test file'

  beforeEach(async () => {
    blobServiceClient = BlobServiceClient.fromConnectionString(blobStorageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(blobStorageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()

    for (const filename of mockFileList) {
      const blob = container.getBlockBlobClient(`${blobStorageConfig.inboundFolder}/${filename}`)
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
    await server.stop()
  })
})
