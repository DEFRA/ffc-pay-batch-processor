const mockCorrelationId = require('../../../mocks/correlation-id')
const { filename1 } = require('../../../mocks/glos-filenames')

const groupByInvoiceNumber = require('../../../../app/processing/glos/group-by-invoice-number')

describe('group by invoice number', () => {
  test('should group by invoice number with 2 invoice lines', () => {
    const paymentRequests = [{
      correlationId: mockCorrelationId,
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
    }, {
      correlationId: mockCorrelationId,
      batch: filename1,
      batchExportDate: '31/05/2023 22:01:38',
      invoiceNumber: '33315 16',
      paymentRequestNumber: 1,
      frn: '1102294241',
      sbi: '106609512',
      claimDate: '31/05/2023 22:01:38',
      standardCode: '028Z141Q',
      description: 'English Woodland Grant Scheme',
      value: 32
    }]

    const groupedPayments = groupByInvoiceNumber(paymentRequests)

    expect(groupedPayments.find(x => x.invoiceNumber === '33315 16').invoiceLines.length).toBe(2)
  })

  test('should group by invoice number with multiple unique invoice numbers', () => {
    const paymentRequests = [{
      correlationId: mockCorrelationId,
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
    }, {
      correlationId: mockCorrelationId,
      batch: filename1,
      batchExportDate: '31/05/2023 22:01:38',
      invoiceNumber: '33315 16',
      paymentRequestNumber: 1,
      frn: '1102294241',
      sbi: '106609512',
      claimDate: '31/05/2023 22:01:38',
      standardCode: '028Z141Q',
      description: 'English Woodland Grant Scheme',
      value: 32
    }, {
      correlationId: mockCorrelationId,
      batch: filename1,
      batchExportDate: '31/05/2023 22:01:38',
      invoiceNumber: '23747 13',
      paymentRequestNumber: 1,
      frn: '1102294241',
      sbi: '106609512',
      claimDate: '31/05/2023 22:01:38',
      standardCode: '028Z141Q',
      description: 'English Woodland Grant Scheme',
      value: 32
    }, {
      correlationId: mockCorrelationId,
      batch: filename1,
      batchExportDate: '31/05/2023 22:01:38',
      invoiceNumber: '33315 16',
      paymentRequestNumber: 1,
      frn: '1102294241',
      sbi: '106609512',
      claimDate: '31/05/2023 22:01:38',
      standardCode: '028Z141Q',
      description: 'English Woodland Grant Scheme',
      value: 32
    }]

    const groupedPayments = groupByInvoiceNumber(paymentRequests)

    expect(groupedPayments.find(x => x.invoiceNumber === '33315 16').invoiceLines.length).toBe(3)
    expect(groupedPayments.find(x => x.invoiceNumber === '23747 13').invoiceLines.length).toBe(1)
  })
})
