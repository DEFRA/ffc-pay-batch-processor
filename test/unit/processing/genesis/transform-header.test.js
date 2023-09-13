const transformHeader = require('../../../../app/processing/genesis/transform-header')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')
const filename = require('../../../mocks/filename')
const { es } = require('../../../../app/constants/schemes')

describe('transform genesis header', () => {
  const correlationId = require('../../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  test('transforms ES header', async () => {
    const headerData = ['I', '1096514', 'AG00679935', 'ESS', '612456', 'null', '2022', '100.00']
    const result = transformHeader(headerData, es.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      schemeId: es.schemeId,
      batch: filename,
      invoiceNumber: '1096514',
      paymentRequestNumber: 1,
      contractNumber: 'AG00679935',
      vendor: '612456',
      value: 100,
      marketingYear: '2022',
      invoiceLines: []
    })
  })
})
