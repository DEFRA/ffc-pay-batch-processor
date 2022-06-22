jest.useFakeTimers()

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

const mockSendEvent = jest.fn()
jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEvent: jest.fn().mockImplementation(() => {
      return {
        sendEvent: mockSendEvent
      }
    }),
    PublishEventBatch: jest.fn().mockImplementation(() => {
      return {
        sendEvents: jest.fn()
      }
    })
  }
})

const { BlobServiceClient } = require('@azure/storage-blob')
const path = require('path')

const db = require('../../../app/data')
const config = require('../../../app/config/blob-storage')
const processBatches = require('../../../app/process-batches')

let blobServiceClient
let container

const TEST_FILE = path.resolve(__dirname, '../../files/SITIELM0001_AP_20210812105407541.dat')
const TEST_INVALID_FILE = path.resolve(__dirname, '../../files/SITIELM0001_AP_20210812105407542.dat')

describe('process acknowledgement', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    const scheme = {
      schemeId: 2,
      scheme: 'SFI Pilot'
    }

    const sequence = {
      schemeId: 2,
      next: 1
    }

    const statuses = [{
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

    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407541.dat`)
    await blockBlobClient.uploadFile(TEST_FILE)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('sends all payment requests', async () => {
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers', async () => {
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFI00000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFI00000002')
  })

  test('sends payment request numbers', async () => {
    await processBatches()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success', async () => {
    await processBatches()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.archiveFolder })) {
      fileList.push(item.name)
    }
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

  test('calls PublishEvent.sendEvent once when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407542.dat`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILE)

    await processBatches()

    expect(mockSendEvent.mock.calls.length).toBe(1)
  })

  test('calls PublishEvent.sendEvent with event.name "batch-processing-quarantine-error" when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407542.dat`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILE)

    await processBatches()

    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-quarantine-error')
  })

  test('calls PublishEvent.sendEvent with event.properties.status "error" when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/SITIELM0001_AP_20210812105407542.dat`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILE)

    await processBatches()

    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })
})
