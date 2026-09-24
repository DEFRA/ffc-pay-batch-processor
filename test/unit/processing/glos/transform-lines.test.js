jest.mock('node:crypto')
const { randomUUID } = require('node:crypto')
const { getSchemeIds } = require('ffc-pay-schemes')

const { filename1 } = require('../../../mocks/glos-filenames')

const transformLine = require('../../../../app/processing/glos/transform-line')

const { FC } = getSchemeIds()

const batchLine = [
  '', '', '', '31/05/2023 22:01:38', '', '', '0725', '33315 16', '81',
  '422', 'RDPE Voluntary Modulation', 'English Woodland Grant Scheme',
  '028Z141Q', '', '', '', '22/23', '', '', '', '', '1102294241', '',
  '31/05/2023 22:01:38', '106609512', '31/05/2023 22:01:38'
]

describe('Transform line', () => {
  const correlationId = require('../../../mocks/correlation-id')
  randomUUID.mockReturnValue(correlationId)

  test('transforms GLOS line', () => {
    const result = transformLine(batchLine, FC, filename1)

    expect(result).toEqual({
      correlationId,
      schemeId: FC,
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

  test('returns undefined if value is NaN', () => {
    const invalidBatchLine = [...batchLine]
    invalidBatchLine[8] = '...'

    const result = transformLine(invalidBatchLine, FC, filename1)

    expect(result.value).toBeUndefined()
  })
})
