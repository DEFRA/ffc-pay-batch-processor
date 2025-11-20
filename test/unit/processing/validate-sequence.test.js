let batch
let validateSequence

const setupMocks = (mockDisableSequenceValidation = false) => {
  jest.resetModules()
  jest.mock('../../../app/processing/batch')
  batch = require('../../../app/processing/batch')
  jest.mock('../../../app/config/processing', () => ({
    disableSequenceValidation: mockDisableSequenceValidation
  }))
  validateSequence = require('../../../app/processing/validate-sequence')
}

const schemes = require('../../../app/constants/schemes')

describe('validate sequence (refactored with test.each)', () => {
  const testCases = [
    [schemes.sfi, 'SITISFI0001_AP_20220622120000000.dat', 1, true],
    [schemes.sfi, 'SITISFI0001_AP_20220622120000000.dat', 2, false],
    [schemes.sfi, 'SITISFI0002_AP_20220622120000000.dat', 1, false],
    [schemes.sfiPilot, 'SITIELM0001_AP_20220622120000000.dat', 1, true],
    [schemes.sfiPilot, 'SITIELM0001_AP_20220622120000000.dat', 2, false],
    [schemes.sfiPilot, 'SITIELM0002_AP_20220622120000000.dat', 1, false],
    [schemes.lumpSums, 'SITILSES0001_AP_20220622120000000.dat', 1, true],
    [schemes.lumpSums, 'SITILSES0001_AP_20220622120000000.dat', 2, false],
    [schemes.lumpSums, 'SITILSES0002_AP_20220622120000000.dat', 1, false],
    [schemes.cs, 'SITICS0001_AP_20230315124537408.dat', 1, true],
    [schemes.cs, 'SITICS0001_AP_20230315124537408.dat', 2, false],
    [schemes.cs, 'SITICS0002_AP_20230315124537408.dat', 1, false],
    [schemes.bps, 'SITI_0001_AP_20230315123734837.dat', 1, true],
    [schemes.bps, 'SITI_0001_AP_20230315123734837.dat', 2, false],
    [schemes.bps, 'SITI_0002_AP_20230315123734837.dat', 1, false],
    [schemes.fdmr, 'FDMR_0001_AP_20230315124537408.dat', 1, true],
    [schemes.fdmr, 'FDMR_0001_AP_20230315124537408.dat', 2, false],
    [schemes.fdmr, 'FDMR_0002_AP_20230315124537408.dat', 1, false],
    [schemes.fc, 'FCAP_0001_230607220141.dat', 1, true],
    [schemes.fc, 'FCAP_0001_230607220141.dat', 2, false],
    [schemes.fc, 'FCAP_0002_230607220141.dat', 1, false],
    [schemes.es, 'GENESISPayReq_20230101_0001.gne', 1, true],
    [schemes.es, 'GENESISPayReq_20230101_0001.gne', 2, false],
    [schemes.es, 'GENESISPayReq_20230101_0002.gne', 1, false],
    [schemes.imps, 'FIN_IMPS_AR_0001.INT', 1, true],
    [schemes.imps, 'FIN_IMPS_AR_0001.INT', 2, false],
    [schemes.imps, 'FIN_IMPS_AR_0002.INT', 1, false],
    [schemes.sfi23, 'SITISFIA0001_AP_20220622120000000.dat', 1, true],
    [schemes.sfi23, 'SITISFIA0001_AP_20220622120000000.dat', 2, false],
    [schemes.sfi23, 'SITISFIA0002_AP_20220622120000000.dat', 1, false],
    [schemes.delinked, 'SITIDP0001_AP_20220622120000000.dat', 1, true],
    [schemes.delinked, 'SITIDP0001_AP_20220622120000000.dat', 2, false],
    [schemes.delinked, 'SITIDP0002_AP_20220622120000000.dat', 1, false],
    [schemes.combinedOffer, 'ESFIO0001_AP_20220622120000000.dat', 1, true],
    [schemes.combinedOffer, 'ESFIO0001_AP_20220622120000000.dat', 2, false],
    [schemes.combinedOffer, 'ESFIO0002_AP_20220622120000000.dat', 1, false]
  ]

  test.each(testCases)(
    'validate sequence for scheme %p with file %s and nextSequence %i should return success=%s',
    async (scheme, file, nextSequence, expectedSuccess) => {
      setupMocks()
      batch.nextSequenceId.mockResolvedValue(nextSequence)
      const result = await validateSequence(scheme.schemeId, file)
      expect(result.success).toBe(expectedSuccess)
      expect(result.expectedSequence).toBe(nextSequence)

      let currentSequence

      // Determine current sequence from filename
      if (scheme === schemes.fc) {
        // Updated regex for FC filenames like FCAP_0001_230607220141.dat
        const match = file.match(/^FCAP_(\d{4})_/)
        currentSequence = match ? parseInt(match[1], 10) : NaN
      } else if (scheme === schemes.es) {
        const match = file.match(/_(\d{4})\.gne$/)
        currentSequence = match ? parseInt(match[1], 10) : NaN
      } else if (scheme === schemes.imps) {
        const match = file.match(/_(\d{4})\.INT$/)
        currentSequence = match ? parseInt(match[1], 10) : NaN
      } else {
        const match = file.match(/(?:000|0000)?(\d{1,4})_AP/)
        currentSequence = match ? parseInt(match[1], 10) : NaN
      }

      expect(result.currentSequence).toBe(currentSequence)
    }
  )

  test('throws error for invalid schemeId', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(validateSequence(99, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  test('throws error for undefined scheme', async () => {
    setupMocks()
    batch.nextSequenceId.mockResolvedValue(1)
    await expect(validateSequence(undefined, 'SITISFI0001_AP_20220622120000000.dat')).rejects.toThrow()
  })

  test('returns success if sequence validation disabled', async () => {
    setupMocks(true)
    batch.nextSequenceId.mockResolvedValue(2)
    const result = await validateSequence(schemes.sfi.schemeId, 'SITISFI0001_AP_20220622120000000.dat')
    expect(result.success).toBeTruthy()
  })
})
