jest.mock('../../../app/event')

const parseBatchLineType = require('../../../app/parse-siti-payment-file/parse-payment-file')

describe('SITI payment file batch header is split into batches, headers and lines', () => {
  let batchLine = 'H'
  const batch = ''

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('batchLine[0] should be a single character when batchLine and batch are received', async () => {
    const lineType = batchLine[0]
    expect(lineType).toHaveLength(1)
    expect(typeof (lineType)).toBe('string')
  })

  test('batchLine[0] should be either "B", "H" or "L" when batchLine and batch are received', async () => {
    const lineType = batchLine[0]
    expect(['B', 'H', 'L']).toContain(lineType)
  })

  test('should return true when batchLine[0] is either "B", "H" or "L" when batchLine and batch are received', async () => {
    const result = parseBatchLineType(batchLine, batch)
    expect(result).toBe(true)
  })

  test('should return false when batchLine[0] is not either "B", "H" or "L" when batchLine and batch are received', async () => {
    batchLine = 'S'
    const result = parseBatchLineType(batchLine, batch)
    expect(result).toBe(false)
  })
})
