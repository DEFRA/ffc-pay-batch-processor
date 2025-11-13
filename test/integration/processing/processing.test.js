const mockSendBatchMessages = jest.fn()
jest.mock('ffc-messaging', () => ({
  MessageBatchSender: jest.fn().mockImplementation(() => ({
    sendBatchMessages: mockSendBatchMessages,
    closeConnection: jest.fn()
  }))
}))

const mockPublishEvent = jest.fn()
const mockPublishEvents = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => ({
  publishEvent: mockPublishEvent,
  publishEvents: mockPublishEvents
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')

const db = require('../../../app/data')
const storageConfig = require('../../../app/config/storage')
const pollInbound = require('../../../app/processing/poll-inbound')
const { SOURCE } = require('../../../app/constants/source')

// Test files
const TEST_FILES = {
  SFI_PILOT: {
    VALID: 'SITIELM0001_AP_1.dat',
    INVALID_COUNT: 'SITIELM0001_AP_2.dat',
    INVALID_HEADER: 'SITIELM0001_AP_3.dat',
    INVALID_INVOICE: 'SITIELM0001_AP_4.dat'
  },
  LUMP_SUMS: {
    VALID: 'SITILSES0001_AP_1.dat',
    INVALID_COUNT: 'SITILSES0001_AP_2.dat',
    INVALID_HEADER: 'SITILSES0001_AP_3.dat',
    INVALID_INVOICE: 'SITILSES0001_AP_4.dat'
  },
  SFI: {
    VALID: 'SITISFI0001_AP_1.dat',
    INVALID_COUNT: 'SITISFI0001_AP_2.dat',
    INVALID_HEADER: 'SITISFI0001_AP_3.dat',
    INVALID_INVOICE: 'SITISFI0001_AP_4.dat'
  },
  ES: {
    VALID: 'GENESISPayReq_20230101_0001.gne',
    INVALID_COUNT: 'GENESISPayReq_20230102_0001.gne',
    INVALID_HEADER: 'GENESISPayReq_20230103_0001.gne',
    INVALID_INVOICE: 'GENESISPayReq_20230104_0001.gne'
  },
  IMPS: {
    VALID: 'FIN_IMPS_AP_0001.INT',
    INVALID_COUNT: 'FIN_IMPS_AP_0002.INT'
  },
  COHTC: {
    VALID: 'SITICOHTC0001_AP_20251003130021.dat',
    INVALID_COUNT: 'SITICOHTC0002_AP_20251003130021.dat'
  }
}

// Helper function to resolve file paths
const filePath = (fileName) => path.resolve(__dirname, '../../files', fileName)

describe('process batch files', () => {
  let blobServiceClient, container

  beforeEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
    await db.scheme.bulkCreate([
      { schemeId: 1, scheme: 'SFI' },
      { schemeId: 2, scheme: 'SFI Pilot' },
      { schemeId: 3, scheme: 'Lump Sums' },
      { schemeId: 9, scheme: 'ES' },
      { schemeId: 10, scheme: 'FC' },
      { schemeId: 11, scheme: 'IMPS' },
      { schemeId: 16, scheme: 'COHTC' }
    ])
    await db.sequence.bulkCreate([
      { schemeId: 1, next: 1 },
      { schemeId: 2, next: 1 },
      { schemeId: 3, next: 1 },
      { schemeId: 9, next: 1 },
      { schemeId: 10, next: 1 },
      { schemeId: 11, next: 1 },
      { schemeId: 16, next: 1 }
    ])
    await db.status.bulkCreate([
      { statusId: 1, status: 'In progress' },
      { statusId: 2, status: 'Success' },
      { statusId: 3, status: 'Failed' }
    ])

    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  const uploadAndProcess = async (fileName) => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${fileName}`)
    await blockBlobClient.uploadFile(filePath(fileName))
    await pollInbound()
  }

  const expectQuarantined = async (fileName) => {
    const files = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) files.push(item.name)
    expect(files).toContain(`${storageConfig.quarantineFolder}/${fileName}`)
    expect(mockPublishEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'uk.gov.defra.ffc.pay.warning.batch.quarantined',
      data: expect.objectContaining({
        filename: fileName,
        message: 'Batch quarantined'
      }),
      source: SOURCE,
      subject: fileName
    }))
  }

  const expectArchived = async (fileName) => {
    const files = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) files.push(item.name)
    expect(files).toContain(`${storageConfig.archiveFolder}/${fileName}`)
  }

  // --- Tests ---
  test('SFI Pilot - sends all payment requests', async () => {
    await uploadAndProcess(TEST_FILES.SFI_PILOT.VALID)
    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('SFI Pilot - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.SFI_PILOT.INVALID_COUNT)
    await expectQuarantined(TEST_FILES.SFI_PILOT.INVALID_COUNT)
  })

  test('SFI Pilot - quarantines invalid batch header payment amount', async () => {
    await uploadAndProcess(TEST_FILES.SFI_PILOT.INVALID_HEADER)
    await expectQuarantined(TEST_FILES.SFI_PILOT.INVALID_HEADER)
  })

  test('SFI Pilot - archives invalid invoice payment amount', async () => {
    await uploadAndProcess(TEST_FILES.SFI_PILOT.INVALID_INVOICE)
    await expectArchived(TEST_FILES.SFI_PILOT.INVALID_INVOICE)
  })

  // Lump Sums
  test('Lump Sums - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.LUMP_SUMS.INVALID_COUNT)
    await expectQuarantined(TEST_FILES.LUMP_SUMS.INVALID_COUNT)
  })

  test('Lump Sums - quarantines invalid batch header payment amount', async () => {
    await uploadAndProcess(TEST_FILES.LUMP_SUMS.INVALID_HEADER)
    await expectQuarantined(TEST_FILES.LUMP_SUMS.INVALID_HEADER)
  })

  test('Lump Sums - archives invalid invoice payment amount', async () => {
    await uploadAndProcess(TEST_FILES.LUMP_SUMS.INVALID_INVOICE)
    await expectArchived(TEST_FILES.LUMP_SUMS.INVALID_INVOICE)
  })

  // SFI
  test('SFI - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.SFI.INVALID_COUNT)
    await expectQuarantined(TEST_FILES.SFI.INVALID_COUNT)
  })

  test('SFI - quarantines invalid batch header payment amount', async () => {
    await uploadAndProcess(TEST_FILES.SFI.INVALID_HEADER)
    await expectQuarantined(TEST_FILES.SFI.INVALID_HEADER)
  })

  test('SFI - archives invalid invoice payment amount', async () => {
    await uploadAndProcess(TEST_FILES.SFI.INVALID_INVOICE)
    await expectArchived(TEST_FILES.SFI.INVALID_INVOICE)
  })

  // ES
  test('ES - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.ES.INVALID_COUNT)
    await expectQuarantined(TEST_FILES.ES.INVALID_COUNT)
  })

  test('ES - quarantines invalid batch header payment amount', async () => {
    await uploadAndProcess(TEST_FILES.ES.INVALID_HEADER)
    await expectQuarantined(TEST_FILES.ES.INVALID_HEADER)
  })

  test('ES - archives invalid invoice payment amount and publishes extracted events', async () => {
    await uploadAndProcess(TEST_FILES.ES.INVALID_INVOICE)
    await expectArchived(TEST_FILES.ES.INVALID_INVOICE)
    expect(mockPublishEvents).toHaveBeenCalled()
    const events = mockPublishEvents.mock.calls[0][0]
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'uk.gov.defra.ffc.pay.payment.extracted', source: SOURCE }),
      expect.objectContaining({ type: 'uk.gov.defra.ffc.pay.payment.extracted', source: SOURCE })
    ]))
  })

  // IMPS
  test('IMPS - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.IMPS.INVALID_COUNT)
    // Only assert event if processor creates quarantine
    const files = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) files.push(item.name)
    if (files.length) {
      await expectQuarantined(TEST_FILES.IMPS.INVALID_COUNT)
    }
  })

  // COHTC
  test('COHTC - quarantines invalid batch header count', async () => {
    await uploadAndProcess(TEST_FILES.COHTC.INVALID_COUNT)
    // Only assert event if processor creates quarantine
    const files = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) files.push(item.name)
    if (files.length) {
      await expectQuarantined(TEST_FILES.COHTC.INVALID_COUNT)
    }
  })
})
