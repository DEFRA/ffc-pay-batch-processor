jest.mock('ffc-pay-schemes', () => ({
  getSchemes: jest.fn()
}))

const { createKnexMock } = require('../helpers/mock-knex')

const mockDb = createKnexMock(['schemes', 'sequences'])

jest.mock('../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { getSchemes } = require('ffc-pay-schemes')
const { updateSchemesDatabase } = require('../../app/update-schemes-database')

describe('update schemes database', () => {
  let consoleLogSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves(undefined)
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

    await updateSchemesDatabase()

    expect(mockDb.tables.schemes).toHaveBeenCalledTimes(2)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: scheme.schemeId })
    expect(mockDb.builder.first).toHaveBeenCalledTimes(1)

    expect(mockDb.builder.insert).toHaveBeenNthCalledWith(1, {
      schemeId: scheme.schemeId,
      scheme: scheme.schemeName
    })
    expect(mockDb.builder.onConflict).toHaveBeenCalledWith('schemeId')
    expect(mockDb.builder.merge).toHaveBeenCalledTimes(1)

    expect(mockDb.tables.sequences).toHaveBeenCalledTimes(1)
    expect(mockDb.builder.insert).toHaveBeenNthCalledWith(2, {
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
    mockDb.builder.resolves({ schemeId: scheme.schemeId })

    await updateSchemesDatabase()

    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: scheme.schemeId })
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(1)
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      scheme: scheme.schemeName
    })
    expect(mockDb.builder.merge).toHaveBeenCalledTimes(1)
    expect(mockDb.tables.sequences).not.toHaveBeenCalled()

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
    mockDb.builder.resolves({})

    await updateSchemesDatabase()

    expect(mockDb.builder.first).toHaveBeenCalledTimes(2)
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(2)

    expect(mockDb.builder.insert).toHaveBeenNthCalledWith(1, {
      schemeId: 1,
      scheme: 'Scheme one'
    })

    expect(mockDb.builder.insert).toHaveBeenNthCalledWith(2, {
      schemeId: 2,
      scheme: 'Scheme two'
    })
  })

  test('rejects when the scheme lookup fails', async () => {
    const error = new Error('Database error')

    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Scheme one' }
    ])
    mockDb.builder.rejects(error)

    await expect(updateSchemesDatabase()).rejects.toBe(error)
    expect(mockDb.builder.insert).not.toHaveBeenCalled()
  })

  test('rejects when sequence creation fails', async () => {
    const error = new Error('Sequence creation error')

    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Scheme one' }
    ])
    mockDb.builder.insert
      .mockImplementationOnce(() => mockDb.builder)
      .mockImplementationOnce(() => Promise.reject(error))

    await expect(updateSchemesDatabase()).rejects.toBe(error)
  })
})
