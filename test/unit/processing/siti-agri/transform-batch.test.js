const { AP } = require('../../../../app/constants/ledger')
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

  test('transforms BPS batch', async () => {
    const headerData = ['B', '2023-03-27', '2', '200', '1', 'BPS', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2023-03-27',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'BPS',
      ledger: AP
    })
  })

  test('transforms CS batch', async () => {
    const headerData = ['B', '2023-03-27', '2', '200', '1', 'CS', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2023-03-27',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'CS',
      ledger: AP
    })
  })

  test('transforms FDMR batch', async () => {
    const headerData = ['B', '2023-03-27', '2', '200', '1', 'FDMR', 'AP']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      exportDate: '2023-03-27',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'FDMR',
      ledger: AP
    })
  })

  test('returns undefined values if line empty', async () => {
    const headerData = []
    const result = transformBatch(headerData)
    Object.values(result).forEach(value => expect(value).toBeUndefined())
  })
})
