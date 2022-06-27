jest.mock('../../../app/processing/batch')
const batch = require('../../../app/processing/batch')
const validateSequence = require('../../../app/processing/validate-sequence')
const { sfi, sfiPilot, lumpSums } = require('../../../app/schemes')

describe('Validate sequence', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('returns success if next sequence matches expected for SFI', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for SFI', async () => {
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for SFI', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for SFI Pilot', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for SFI Pilot', async () => {
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for SFI Pilot', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for Lump Sums', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES_0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for Lump Sums', async () => {
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES_0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for Lump Sums', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES_0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('throws error for invalid scheme', async () => {
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(async () => validateSequence(99, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  // test('returns success if sequence validation disabled and lower than expected', async () => {
  //   batch.nextSequenceId.mockResolvedValue(2)
  //   const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
  //   expect(result.success).toBeTruthy()
  //   expect(result.expectedSequence).toBe(1)
  //   expect(result.currentSequence).toBe(1)
  // })

  // test('returns success if sequence validation disabled and higher than expected', async () => {
  //   batch.nextSequenceId.mockResolvedValue(1)
  //   const result = await validateSequence(sfi.schemeId, 'SITISFI0002_AP_20220622120000000.dat')
  //   expect(result.success).toBeTruthy()
  //   expect(result.expectedSequence).toBe(1)
  //   expect(result.currentSequence).toBe(1)
  // })
})
