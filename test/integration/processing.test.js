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
const mockSendEventBatch = jest.fn()
jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEvent: jest.fn().mockImplementation(() => {
      return {
        sendEvent: mockSendEvent
      }
    }),
    PublishEventBatch: jest.fn().mockImplementation(() => {
      return {
        sendEvents: mockSendEventBatch
      }
    })
  }
})

const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')

const db = require('../../app/data')
const storageConfig = require('../../app/config/storage')

const pollInbound = require('../../app/processing/poll-inbound')

let blobServiceClient
let container

const TEST_FILE_SFI_PILOT = 'SITIELM0001_AP_1.dat'
const TEST_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_FILE_SFI_PILOT)

const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT = 'SITIELM0001_AP_2.dat'
const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT = 'SITIELM0001_AP_3.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT = 'SITIELM0001_AP_4.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT)

const TEST_FILE_LUMP_SUMS = 'SITILSES0001_AP_1.dat'
const TEST_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_FILE_LUMP_SUMS)

const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_LUMP_SUMS = 'SITILSES0001_AP_2.dat'
const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_LUMP_SUMS)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_LUMP_SUMS = 'SITILSES0001_AP_3.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_LUMP_SUMS)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS = 'SITILSES0001_AP_4.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_LUMP_SUMS = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS)

const TEST_FILE_SFI = 'SITISFI0001_AP_1.dat'
const TEST_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_FILE_SFI)

const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI = 'SITISFI0001_AP_2.dat'
const TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI = 'SITISFI0001_AP_3.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI)

const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI = 'SITISFI0001_AP_4.dat'
const TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI = path.resolve(__dirname, '../files', TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI)

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

    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('sends all payment requests for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFIP0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFIP0000002')
  })

  test('sends payment request numbers for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('ignores unrelated file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inbound}/ignore me.dat`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat()) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.inbound}/ignore me.dat`).length).toBe(1)
  })

  test('quarantines invalid batch header number of payment requests to actual number of payment requests for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('quarantines invalid batch header payment amount to header payment amount file for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('archives invalid batch header payment amount to invoice lines payment amount file for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`).length).toBe(1)
  })

  test('does not quarantine invalid batch header payment amount to invoice lines payment amount file for SFI Pilot', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`).length).toBe(0)
  })

  test('sends all payment requests for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('LSES0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('LSES0000002')
  })

  test('sends payment request numbers for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_LUMP_SUMS)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('quarantines invalid batch header number of payment requests to actual number of payment requests for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_LUMP_SUMS)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('quarantines invalid batch header payment amount to header payment amount file for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_LUMP_SUMS)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('archives invalid batch header payment amount to invoice lines payment amount file for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_LUMP_SUMS)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS}`).length).toBe(1)
  })

  test('does not quarantine invalid batch header payment amount to invoice lines payment amount file for Lump Sums', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_LUMP_SUMS)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_LUMP_SUMS}`).length).toBe(0)
  })

  test('sends all payment requests for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends invoice numbers for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber).toBe('SFIP0000001')
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.invoiceNumber).toBe('SFIP0000002')
  })

  test('sends payment request numbers for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)

    await pollInbound()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(1)
    expect(mockSendBatchMessages.mock.calls[0][0][1].body.paymentRequestNumber).toBe(3)
  })

  test('archives file on success for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_FILEPATH_SFI)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_FILE_SFI}`).length).toBe(1)
  })

  test('quarantines invalid batch header number of payment requests to actual number of payment requests for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI}`).length).toBe(1)
  })

  test('quarantines invalid batch header payment amount to header payment amount file for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI}`).length).toBe(1)
  })

  test('archives invalid batch header payment amount to invoice lines payment amount file for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI}`).length).toBe(1)
  })

  test('does not quarantine invalid batch header payment amount to invoice lines payment amount file for SFI', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI)

    await pollInbound()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI}`).length).toBe(0)
  })

  test('calls PublishEvent.sendEvent once when an invalid batch header number of payment requests to actual number of payment requests file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent).toHaveBeenCalledTimes(1)
  })

  test('calls PublishEvent.sendEvent with event.name "batch-processing-quarantine-error" when an invalid batch header number of payment requests to actual number of payment requests file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-quarantine-error')
  })

  test('calls PublishEvent.sendEvent with event.properties.status "error" when an invalid batch header number of payment requests to actual number of payment requests file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('calls PublishEvent.sendEvent once when an invalid batch header payment amount to header payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent).toHaveBeenCalledTimes(1)
  })

  test('calls PublishEvent.sendEvent with event.name "batch-processing-quarantine-error" when an invalid batch header payment amount to header payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].name).toBe('batch-processing-quarantine-error')
  })

  test('calls PublishEvent.sendEvent with event.properties.status "error" when an invalid batch header payment amount to header payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_HEADER_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEvent.mock.calls[0][0].properties.status).toBe('error')
  })

  test('calls PublishEventBatch.sendEvents when an invalid batch header payment amount to invoice lines payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEventBatch).toHaveBeenCalledTimes(1)
  })

  test('calls PublishEventBatch.sendEvents with event.name "batch-processing-payment-request-invalid" when an invalid batch header payment amount to header payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEventBatch.mock.calls[0][0][0].name).toBe('batch-processing-payment-request-invalid')
  })

  test('calls PublishEventBatch.sendEvents with event.properties.status "error" when an invalid batch header payment amount to header payment amount file is given', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES__PAYMENT_AMOUNT_FILE_SFI_PILOT}`)
    await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_PAYMENT_AMOUNT_TO_INVOICE_LINES_PAYMENT_AMOUNT_FILEPATH_SFI_PILOT)

    await pollInbound()

    expect(mockSendEventBatch.mock.calls[0][0][0].properties.status).toBe('error')
  })
})
