jest.mock('ffc-pay-schemes', () => ({
  getSourceSystems: jest.fn(() => ({
    ES: 'Genesis'
  }))
}))

const transformBatch = require('../../../../app/processing/genesis/transform-batch')

describe('transform batch', () => {
  test('transforms ES batch', () => {
    const headerData = ['H', '04/01/2023', '2', '46', '200', '0001']
    const result = transformBatch(headerData)

    expect(result).toMatchObject({
      exportDate: '04/01/2023',
      numberOfPaymentRequests: 2,
      batchValue: 200,
      sequence: 1,
      sourceSystem: 'Genesis'
    })
  })
})
