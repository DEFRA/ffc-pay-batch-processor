const mockCorrelationId = require('../../../mocks/correlation-id')
const { filename1 } = require('../../../mocks/glos-filenames')
const groupByInvoiceNumber = require('../../../../app/processing/glos/group-by-invoice-number')

describe('group by invoice number', () => {
  const basePaymentRequest = {
    correlationId: mockCorrelationId,
    batch: filename1,
    batchExportDate: '31/05/2023 22:01:38',
    paymentRequestNumber: 1,
    frn: '1102294241',
    sbi: '106609512',
    claimDate: '31/05/2023 22:01:38',
    standardCode: '028Z141Q',
    description: 'English Woodland Grant Scheme',
    value: 81
  }

  test.each([
    {
      desc: '2 invoice lines with same invoice number',
      input: ['33315 16', '33315 16'],
      expected: { '33315 16': 2 }
    },
    {
      desc: 'multiple unique invoice numbers',
      input: ['33315 16', '33315 16', '23747 13', '33315 16'],
      expected: { '33315 16': 3, '23747 13': 1 }
    }
  ])('$desc', ({ input, expected }) => {
    const paymentRequests = input.map(invNum => ({ ...basePaymentRequest, invoiceNumber: invNum }))
    const grouped = groupByInvoiceNumber(paymentRequests)

    Object.entries(expected).forEach(([invNum, count]) => {
      expect(grouped.find(x => x.invoiceNumber === invNum).invoiceLines.length).toBe(count)
    })
  })
})
