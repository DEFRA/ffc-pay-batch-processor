const mockSendBatchMessages = jest.fn()
jest.mock('ffc-messaging', () => {
  return {
    MessageBatchSender: jest.fn().mockImplementation(() => {
      return {
        sendBatchMessages: mockSendBatchMessages,
        closeConnection: jest.fn()
      }
    })
  }
})
jest.useFakeTimers()
const processBatches = require('../../../app/process-batches')
const { BlobServiceClient } = require('@azure/storage-blob')
const db = require('../../../app/data')
const config = require('../../../app/config/blob-storage')
const path = require('path')
let scheme
let sequence
let statuses
let blobServiceClient
let container
const TEST_FILE = path.resolve(__dirname, '../../files/SITIELM0001_AP_20210812105407541.dat')
const TEST_INVALID_FILE = path.resolve(__dirname, '../../files/SITIELM0001_AP_20210812105407542.dat')

describe('process acknowledgement', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = {
      schemeId: 2,
      scheme: 'SFI Pilot'
    }

    sequence = {
      schemeId: 2,
      next: 1
    }

    statuses = [{
      statusId: 1,
      status: 'In progress'
    }, {
      statusId: 2,
      status: 'Success'
    }, {
      statusId: 3,
      status: 'Failed'
    }]

    await db.scheme.create(scheme)
    await db.sequence.create(sequence)
    await db.status.bulkCreate(statuses)

    blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
    container = blobServiceClient.getContainerClient(config.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('sends all payment requests', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407541.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407541.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFI00000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFI00000002')
  })

  test('sends payment request numbers', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407541.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407541.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
    await processBatches()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.archiveFolder })) {
      fileList.push(item.name)
    }
    console.log(fileList)
    expect(fileList.filter(x => x === `${config.archiveFolder}/SITIELM0001_AP_20210812105407541.dat`).length).toBe(1)
  })

  test('ignores unrelated file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inbound}/ignore me.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
    await processBatches()
    const fileList = []
    for await (const item of container.listBlobsFlat()) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.inbound}/ignore me.dat`).length).toBe(1)
  })

  test('quarantines invalid file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407542.dat`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILE)
    await processBatches()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.quarantineFolder}/SITIELM0001_AP_20210812105407542.dat`).length).toBe(1)
  })
})
