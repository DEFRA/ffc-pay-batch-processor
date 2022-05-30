
const { nextSequenceId, incrementProcessingTries } = require('../../../app/process-batches/batches')

jest.mock('../../../app/data')
const db = require('../../../app/data')

jest.mock('../../../app/scheme-details')
const schemeDetails  = require('../../../app/scheme-details')

describe('Batches', () => {
  let schemeName

  beforeEach(() => {
    schemeName = 'SFI Pilot'
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('Returns 2 as the next sequence', async () => {
    schemeDetails.getDbIdentifier.mockResolvedValue(1)
    db.sequence.findOne.mockResolvedValue({ next: 2 })
    const response = await nextSequenceId(schemeName)
    expect(response).toBe(2)
  })

  test('Return undefined with no scheme found', async () => {
    schemeDetails.getDbIdentifier.mockResolvedValue(null)
    const response = await nextSequenceId(schemeName)
    expect(response).toBe(undefined)
  })
})
