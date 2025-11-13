const { BlobServiceClient } = require('@azure/storage-blob')
const blobStorageConfig = require('../../app/config/storage')
const blobStorage = require('../../app/storage')

const mockFileList = ['test1.dat', 'test2.dat']
const testFileContents = 'This is a test file'

let blobServiceClient
let container

describe('Blob storage tests', () => {
  beforeEach(async () => {
    blobServiceClient = BlobServiceClient.fromConnectionString(blobStorageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(blobStorageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()

    for (const filename of mockFileList) {
      const blob = container.getBlockBlobClient(`${blobStorageConfig.inboundFolder}/${filename}`)
      await blob.upload(Buffer.from(testFileContents), Buffer.byteLength(Buffer.from(testFileContents)))
    }
  })

  test('List files in inbound blob container', async () => {
    const fileList = await blobStorage.getInboundFileList()
    expect(fileList).toEqual(expect.arrayContaining(mockFileList))
  })

  test.each(mockFileList)('Get details for %s from blob container', async (filename) => {
    const fileDetails = await blobStorage.getInboundFileDetails(filename)
    expect(fileDetails._response.status).toBe(200)
  })

  test.each(mockFileList)('Download %s from blob container', async (filename) => {
    const buffer = await blobStorage.downloadPaymentFile(filename)
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.toString()).toBe(testFileContents)
  })

  test.each(mockFileList)('Archive %s from inbound to archive container', async (filename) => {
    const result = await blobStorage.archivePaymentFile(filename, filename)
    const fileList = await blobStorage.getInboundFileList()
    expect(result).toBe(true)
    expect(fileList.length).toBe(mockFileList.length - 1)
  })
})
