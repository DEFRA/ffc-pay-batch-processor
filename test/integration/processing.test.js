const mockSendBatchMessages = jest.fn()
const mockSendEvent = jest.fn()
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
const pollInbound = require('../../app/processing/poll-inbound')
const { BlobServiceClient } = require('@azure/storage-blob')
const db = require('../../app/data')
const config = require('../../app/config/storage')
const path = require('path')
let blobServiceClient
let container

const TEST_FILE_SFI_PILOT = 'SITIELM0001_AP_20210812105407541.dat'
const TEST_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_FILE_SFI_PILOT)
const TEST_INVALID_FILE_SFI_PILOT = 'SITIELM0001_AP_20210812105407542.dat'
const TEST_INVALID_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_INVALID_FILE_SFI_PILOT)

const TEST_FILE_LUMP_SUMS = 'SITILSES_0001_AP_20220624212100913.dat'
const TEST_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_FILE_LUMP_SUMS)
const TEST_INVALID_FILE_LUMP_SUMS = 'SITILSES_0001_AP_20220624212100914.dat'
const TEST_INVALID_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_INVALID_FILE_LUMP_SUMS)

const TEST_FILE_SFI = 'SITISFI0001_AP_20210812105407545.dat'
const TEST_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_FILE_SFI)
const TEST_INVALID_FILE_SFI = 'SITISFI0001_AP_20210812105407546.dat'
const TEST_INVALID_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_INVALID_FILE_SFI)

describe('process batch files', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
    await db.scheme.bulkCreate([{
      schemeId: 1,
      scheme: 'SFI'
    }, {
      schemeId: 2,
      scheme: 'SFI Pilot'
    }, {
      schemeId: 3,
      scheme: 'Lump Sums'
    }])
    await db.sequence.bulkCreate([{
      schemeId: 1,
      next: 1
    }, {
      schemeId: 2,
      next: 1
    }, {
      schemeId: 3,
      next: 1
    }])
    await db.status.bulkCreate([{
      statusId: 1,
      status: 'In progress'
    }, {
      statusId: 2,
      status: 'Success'
    }, {
      statusId: 3,
      status: 'Failed'
    }])

    blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
    container = blobServiceClient.getContainerClient(config.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('sends all payment requests for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFIP0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFIP0000002')
  })

  test('sends payment request numbers for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.archiveFolder}/${TEST_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('ignores unrelated file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inbound}/ignore me.dat`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat()) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.inbound}/ignore me.dat`).length).toBe(1)
  })

  test('quarantines invalid file for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_SFI_PILOT)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.quarantineFolder}/${TEST_INVALID_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('sends all payment requests for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('LSES0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('LSES0000002')
  })

  test('sends payment request numbers for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.archiveFolder}/${TEST_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('quarantines invalid file for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_LUMP_SUMS)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.quarantineFolder}/${TEST_INVALID_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('sends all payment requests for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFIP0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFIP0000002')
  })

  test('sends payment request numbers for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)
    await pollInbound()
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.archiveFolder}/${TEST_FILE_SFI}`).length).toBe(1)
  })

  test('quarantines invalid file for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_SFI)
    await pollInbound()
    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.quarantineFolder}/${TEST_INVALID_FILE_SFI}`).length).toBe(1)
  })

  test('calls PublishEvent.sendEvent once when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendEvent.mock.calls.length).toBe(1)
  })

  test('calls PublishEvent.sendEvent with event.name "batch-processing-quarantine-error" when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-quarantine-error')
  })

  test('calls PublishEvent.sendEvent with event.properties.status "error" when an invalid file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${config.inboundFolder}/${TEST_INVALID_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })
})
