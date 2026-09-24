jest.mock('ffc-pay-schemes', () => ({
  getSchemes: jest.fn()
}))

jest.mock('../../app/data', () => ({
  scheme: {
    findOne: jest.fn(),
    upsert: jest.fn()
  },
  sequence: {
    create: jest.fn()
  }
}))

const { getSchemes } = require('ffc-pay-schemes')
const db = require('../../app/data')
const { updateSchemesDatabase } = require('../../app/update-schemes-database')

describe('update schemes database', () => {
  let consoleLogSpy

  beforeEach(() => {
    jest.clearAllMocks()
    db.scheme.findOne.mockResolvedValue(null)
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  test('gets schemes and logs the update check', async () => {
    getSchemes.mockReturnValue([])

    await updateSchemesDatabase()

    expect(getSchemes).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Checking for updates to supported schemes'
    )
  })

  test('creates a new scheme and sequence record', async () => {
    const scheme = {
      schemeId: 1,
      schemeName: 'Sustainable Farming Incentive 22'
    }

    getSchemes.mockReturnValue([scheme])
    db.scheme.findOne.mockResolvedValue(null)
    db.scheme.upsert.mockResolvedValue([{}, true])
    db.sequence.create.mockResolvedValue({})

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledWith({
      where: { schemeId: scheme.schemeId }
    })

    expect(db.scheme.upsert).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      scheme: scheme.schemeName
    })

    expect(db.sequence.create).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      next: 1
    })

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${scheme.schemeName} created`
    )
  })

  test('updates an existing scheme without creating a sequence record', async () => {
    const scheme = {
      schemeId: 2,
      schemeName: 'Updated scheme name'
    }

    getSchemes.mockReturnValue([scheme])
    db.scheme.findOne.mockResolvedValue({ schemeId: scheme.schemeId })
    db.scheme.upsert.mockResolvedValue([{}, false])

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledWith({
      where: { schemeId: scheme.schemeId }
    })

    expect(db.scheme.upsert).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      scheme: scheme.schemeName
    })

    expect(db.sequence.create).not.toHaveBeenCalled()

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${scheme.schemeName} updated`
    )
  })

  test('processes every scheme', async () => {
    const schemes = [
      { schemeId: 1, schemeName: 'Scheme one' },
      { schemeId: 2, schemeName: 'Scheme two' }
    ]

    getSchemes.mockReturnValue(schemes)
    db.scheme.findOne.mockResolvedValue({})
    db.scheme.upsert.mockResolvedValue([{}, false])

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledTimes(2)
    expect(db.scheme.upsert).toHaveBeenCalledTimes(2)

    expect(db.scheme.upsert).toHaveBeenNthCalledWith(1, {
      schemeId: 1,
      scheme: 'Scheme one'
    })

    expect(db.scheme.upsert).toHaveBeenNthCalledWith(2, {
      schemeId: 2,
      scheme: 'Scheme two'
    })
  })

  test('rejects when the scheme upsert fails', async () => {
    const error = new Error('Database error')

    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Scheme one' }
    ])
    db.scheme.findOne.mockResolvedValue(null)
    db.scheme.upsert.mockRejectedValue(error)

    await expect(updateSchemesDatabase()).rejects.toBe(error)
  })

  test('rejects when sequence creation fails', async () => {
    const error = new Error('Sequence creation error')

    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Scheme one' }
    ])
    db.scheme.findOne.mockResolvedValue(null)
    db.scheme.upsert.mockResolvedValue([{}, true])
    db.sequence.create.mockRejectedValue(error)

    await expect(updateSchemesDatabase()).rejects.toBe(error)
  })
})
