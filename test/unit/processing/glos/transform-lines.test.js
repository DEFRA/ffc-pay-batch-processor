jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

const { filename1 } = require('../../../mocks/glos-filenames')

const transformLine = require('../../../../app/processing/glos/transform-line')
const { fc } = require('../../../../app/constants/schemes')

let batchLine = ['', '', '', '31/05/2023 22:01:38', '', '', '0725', '33315 16', '81', '422', 'RDPE Voluntary Modulation', 'English Woodland Grant Scheme', '028Z141Q', '', '', '', '22/23', '', '', '', '', '1102294241', '', '31/05/2023 22:01:38', '106609512', '31/05/2023 22:01:38']

describe('Transform line', () => {
  const correlationId = require('../../../mocks/correlation-id')
  uuidv4.mockReturnValue(correlationId)

  test('transforms GLOS line', async () => {
    const result = transformLine(batchLine, fc.schemeId, filename1)
    expect(result).toEqual({
      correlationId,
      schemeId: fc.schemeId,
      batch: filename1,
      batchExportDate: '31/05/2023 22:01:38',
      invoiceNumber: '33315 16',
      paymentRequestNumber: 1,
      frn: '1102294241',
      sbi: '106609512',
      claimDate: '31/05/2023 22:01:38',
      standardCode: '028Z141Q',
      description: 'English Woodland Grant Scheme',
      value: 81
    })
  })

  test('for GLOS return undefined if value is NaN', async () => {
    batchLine = ['', '', '', '31/05/2023 22:01:38', '', '', '0725', '33315 16', '...', '422', 'RDPE Voluntary Modulation', 'English Woodland Grant Scheme', '028Z141Q', '', '', '', '22/23', '', '', '', '', '1102294241', '', '31/05/2023 22:01:38', '106609512', '31/05/2023 22:01:38']
    const result = transformLine(batchLine, fc.schemeId, filename1)
    expect(result.value).toBe(undefined)
  })
})
