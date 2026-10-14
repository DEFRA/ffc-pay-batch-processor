const TABLES = require('../../../app/constants/tables')
const { PRIMARY_KEYS, COLUMNS, pickColumns } = require('../../../app/constants/columns')

describe('pickColumns', () => {
  test('keeps properties that are columns on the table', () => {
    const record = { filename: 1, sequenceNumber: 'value' }

    expect(pickColumns(record, TABLES.batches)).toEqual(record)
  })

  test('drops properties that are not columns on the table', () => {
    const result = pickColumns({ filename: 1, notAColumn: 'value' }, TABLES.batches)

    expect(result).toEqual({ filename: 1 })
  })

  test('drops the primary key', () => {
    const result = pickColumns({ batchId: 1, filename: 1 }, TABLES.batches)

    expect(result).toEqual({ filename: 1 })
  })

  test('returns an empty object when given no properties', () => {
    expect(pickColumns({}, TABLES.batches)).toEqual({})
  })
})

describe('PRIMARY_KEYS', () => {
  test('each primary key is a column on its table', () => {
    for (const [table, primaryKey] of Object.entries(PRIMARY_KEYS)) {
      expect(COLUMNS[table]).toContain(primaryKey)
    }
  })
})
