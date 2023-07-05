const transformBatch = require('../../../../app/processing/imps/transform-batch')

describe('transform batch', () => {
  test('transforms IMPS batch', async () => {
    const headerData = ['B', '04', '0001', '2', '1', '200.00', '1', 'S']
    const result = transformBatch(headerData)
    expect(result).toMatchObject({
      sequence: 1,
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sourceSystem: 'IMPS'
    })
  })
})
