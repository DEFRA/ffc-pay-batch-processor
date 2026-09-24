let mockDisableSequenceValidation = false

jest.mock('ffc-pay-schemes', () => ({
  getBatchSequenceFromFileName: jest.fn()
}))

jest.mock('../../../app/config/processing', () => ({
  get disableSequenceValidation () {
    return mockDisableSequenceValidation
  }
}))

jest.mock('../../../app/processing/batch', () => ({
  nextSequenceId: jest.fn()
}))

const { getBatchSequenceFromFileName } = require('ffc-pay-schemes')
const batch = require('../../../app/processing/batch')

const loadValidateSequence = () => {
  let validateSequence

  jest.isolateModules(() => {
    validateSequence = require('../../../app/processing/validate-sequence')
  })

  return validateSequence
}

describe('validateSequence', () => {
  const schemeId = 'SFI'
  const filename = 'SITISFI0001_AP_0003.dat'

  beforeEach(() => {
    jest.clearAllMocks()
    mockDisableSequenceValidation = false
    getBatchSequenceFromFileName.mockReturnValue(3)
    batch.nextSequenceId.mockResolvedValue(3)
  })

  test('gets the sequence from the filename', async () => {
    const validateSequence = loadValidateSequence()

    await validateSequence(schemeId, filename)

    expect(getBatchSequenceFromFileName).toHaveBeenCalledWith(
      schemeId,
      filename
    )
  })

  test('gets the expected sequence for the scheme', async () => {
    const validateSequence = loadValidateSequence()

    await validateSequence(schemeId, filename)

    expect(batch.nextSequenceId).toHaveBeenCalledWith(schemeId)
  })

  test('returns success when the sequence matches', async () => {
    const validateSequence = loadValidateSequence()

    await expect(validateSequence(schemeId, filename)).resolves.toEqual({
      success: true,
      currentSequence: 3,
      expectedSequence: 3
    })
  })

  test('returns failure when the sequence does not match', async () => {
    batch.nextSequenceId.mockResolvedValue(4)

    const validateSequence = loadValidateSequence()

    await expect(validateSequence(schemeId, filename)).resolves.toEqual({
      success: false,
      currentSequence: 3,
      expectedSequence: 4
    })
  })

  test('returns success when sequence validation is disabled', async () => {
    mockDisableSequenceValidation = true
    batch.nextSequenceId.mockResolvedValue(4)

    const validateSequence = loadValidateSequence()

    await expect(validateSequence(schemeId, filename)).resolves.toEqual({
      success: true,
      currentSequence: 3,
      expectedSequence: 4
    })
  })
})
