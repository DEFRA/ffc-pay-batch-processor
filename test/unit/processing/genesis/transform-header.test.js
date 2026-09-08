const transformHeader = require('../../../../app/processing/genesis/transform-header')

jest.mock('node:crypto')
const { randomUUID } = require('node:crypto')
const { getSchemeIds } = require('ffc-pay-schemes')
const filename = require('../../../mocks/filename')

describe('transform genesis header', () => {
  const correlationId = require('../../../mocks/correlation-id')
  const { ES } = getSchemeIds()

  randomUUID.mockReturnValue(correlationId)

  test('transforms ES header', () => {
    const headerData = ['I', '1096514', 'AG00679935', 'ESS', '612456', 'null', '2022', '100.00']
    const result = transformHeader(headerData, ES, filename)

    expect(result).toEqual({
      correlationId,
      schemeId: ES,
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
