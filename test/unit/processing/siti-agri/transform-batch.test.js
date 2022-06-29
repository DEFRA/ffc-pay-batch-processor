const { AP } = require('../../../../app/ledgers')
const transformBatch = require('../../../../app/processing/siti-agri/transform-batch')

describe('Transform batch', () => {
  test('transforms SFI batch', async () => {
    const headerData = ['B', '2021-08-12', '2', '200', '1', 'SFI', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2021-08-12',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'SFI',
      ledger: AP
    })
  })

  test('transforms SFI Pilot batch', async () => {
    const headerData = ['B', '2021-08-12', '2', '200', '1', 'SFIP', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2021-08-12',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'SFIP',
      ledger: AP
    })
  })

  test('transforms Lump Sums batch', async () => {
    const headerData = ['B', '2021-08-12', '2', '200', '0001', 'LSES', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2021-08-12',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'LSES',
      ledger: AP
    })
  })

  test('returns undefined values if line empty', async () => {
    const headerData = []
    const result = transformBatch(headerData)
    Object.values(result).forEach(value => expect(value).toBeUndefined())
  })
})
