const transformHeader = require('../../../../app/processing/imps/transform-header')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')
const filename = require('../../../mocks/filename')
const { AP } = require('../../../../app/constants/ledger')
const { imps } = require('../../../../app/constants/schemes')

describe('transform IMPS header', () => {
  const correlationId = require('../../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  test('transforms IMPS header', async () => {
    const headerData = ['H', '04', '9842', 'PAY', 'AP', 'J00001', 'FVR/J00001001', '', '', '', '0', '', 'N', '', '', 'PO', '', '', '', '04-JAN-23', '', '', '', '', '', '', '', '', '']
    const result = transformHeader(headerData, imps.schemeId, filename)
    expect(result).toEqual({
      correlationId,
      schemeId: imps.schemeId,
      batch: filename,
      ledger: AP,
      invoiceNumber: 'FVR/J00001001',
      paymentRequestNumber: 1,
      contractNumber: 'FVR/J00001001',
      trader: 'J00001',
      invoiceLines: []
    })
  })
})
