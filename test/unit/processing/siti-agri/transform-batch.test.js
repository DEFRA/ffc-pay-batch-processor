const { AP } = require('../../../../app/constants/ledger')
const transformBatch = require('../../../../app/processing/siti-agri/transform-batch')

describe('Transform batch', () => {
  const testCases = [
    { header: ['B', '2021-08-12', '2', '200', '1', 'SFI', 'AP'], source: 'SFI', date: '2021-08-12' },
    { header: ['B', '2021-08-12', '2', '200', '1', 'SFIP', 'AP'], source: 'SFIP', date: '2021-08-12' },
    { header: ['B', '2021-08-12', '2', '200', '0001', 'LSES', 'AP'], source: 'LSES', date: '2021-08-12' },
    { header: ['B', '2023-03-27', '2', '200', '1', 'BPS', 'AP'], source: 'BPS', date: '2023-03-27' },
    { header: ['B', '2023-03-27', '2', '200', '1', 'CS', 'AP'], source: 'CS', date: '2023-03-27' },
    { header: ['B', '2023-03-27', '2', '200', '1', 'FDMR', 'AP'], source: 'FDMR', date: '2023-03-27' },
    { header: ['B', '2021-08-12', '2', '200', '1', 'SFIA', 'AP'], source: 'SFIA', date: '2021-08-12' },
    { header: ['B', '2021-08-12', '2', '200', '1', 'DP', 'AP'], source: 'DP', date: '2021-08-12' },
    { header: ['B', '2021-08-12', '2', '200', '1', 'ESFIO', 'AP'], source: 'ESFIO', date: '2021-08-12' },
    { header: ['B', '2021-08-12', '2', '200', '1', 'CSHTR', 'AP'], source: 'CSHTR', date: '2021-08-12' }
  ]

  test.each(testCases)('transforms $source batch', ({ header, source, date }) => {
    const result = transformBatch(header)
    expect(result).toMatchObject({
      exportDate: date,
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: source,
      ledger: AP
    })
  })

  test('returns undefined values if line empty', () => {
    const result = transformBatch([])
    Object.values(result).forEach(value => expect(value).toBeUndefined())
  })
})
