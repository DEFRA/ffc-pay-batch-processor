let batch
let validateSequence

const setupMocks = (mockDisableSequenceValidation = false) => {
  jest.mock('../../../app/processing/batch')
  batch = require('../../../app/processing/batch')
  jest.mock('../../../app/config/processing', () => ({
    disableSequenceValidation: mockDisableSequenceValidation
  }))
  validateSequence = require('../../../app/processing/validate-sequence')
}

const { filename1, filename2 } = require('../../mocks/glos-filenames')

const { sfi, sfiPilot, lumpSums, cs, bps, fdmr, es, fc, imps, sfi23, delinked, combinedOffer } = require('../../../app/constants/schemes')

describe('validate sequence', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('returns success if next sequence matches expected for SFI', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for SFI', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for SFI', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for SFI Pilot', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for SFI Pilot', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for SFI Pilot', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfiPilot.schemeId, 'SITIELM0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for Lump Sums', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for Lump Sums', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for Lump Sums', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(lumpSums.schemeId, 'SITILSES0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for CS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(cs.schemeId, 'SITICS0001_AP_20230315124537408.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for CS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(cs.schemeId, 'SITICS0001_AP_20230315124537408.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for CS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(cs.schemeId, 'SITICS0002_AP_20230315124537408.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for BPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(bps.schemeId, 'SITI_0001_AP_20230315123734837.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for BPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(bps.schemeId, 'SITI_0001_AP_20230315123734837.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for BPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(bps.schemeId, 'SITI_0002_AP_20230315123734837.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for FDMR', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(fdmr.schemeId, 'FDMR_0001_AP_20230315124537408.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for FDMR', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(fdmr.schemeId, 'FDMR_0001_AP_20230315124537408.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for FDMR', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(fdmr.schemeId, 'FDMR_0002_AP_20230315124537408.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for FC', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(fc.schemeId, filename1)
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for FC', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(fc.schemeId, filename1)
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for FC', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(fc.schemeId, filename2)
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for ES', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(es.schemeId, 'GENESISPayReq_20230101_0001.gne')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for ES', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(es.schemeId, 'GENESISPayReq_20230101_0001.gne')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for ES', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(es.schemeId, 'GENESISPayReq_20230101_0002.gne')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for IMPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(imps.schemeId, 'FIN_IMPS_AR_0001.INT')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for IMPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(imps.schemeId, 'FIN_IMPS_AR_0001.INT')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for IMPS', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(imps.schemeId, 'FIN_IMPS_AR_0002.INT')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for SFI23', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi23.schemeId, 'SITISFIA0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for SFI23', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfi23.schemeId, 'SITISFIA0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for SFI23', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi23.schemeId, 'SITISFIA0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for Delinked', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(delinked.schemeId, 'SITIDP0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for Delinked', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(delinked.schemeId, 'SITIDP0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for Delinked', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(delinked.schemeId, 'SITIDP0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('returns success if next sequence matches expected for combined offer', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(combinedOffer.schemeId, 'ESFIO0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next lower than expected for combined offer', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(combinedOffer.schemeId, 'ESFIO0001_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns failure if next higher than expected for combined offer', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(combinedOffer.schemeId, 'ESFIO0002_AP_20220622120000000.dat')
    expect(result.success).toBeFalsy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })

  test('throws error for invalid schemeId', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(async () => validateSequence(99, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  test('throws error for undefined scheme', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(async () => validateSequence(undefined, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  test('throws error for null scheme', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(async () => validateSequence(null, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  test('returns success if sequence validation disabled and lower than expected', async () => {
    setupMocks(true)
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(2)
    expect(result.currentSequence).toBe(1)
  })

  test('returns success if sequence validation disabled and higher than expected', async () => {
    setupMocks(true)
    batch.nextSequenceId.mockResolvedValue(1)
    const result = await validateSequence(sfi.schemeId, 'SITISFI0002_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
    expect(result.expectedSequence).toBe(1)
    expect(result.currentSequence).toBe(2)
  })
})
