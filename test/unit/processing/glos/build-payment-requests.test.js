const buildPaymentRequests = require('../../../../app/processing/glos/build-payment-requests')

describe('buildPaymentRequests', () => {
  test('returns an empty array when payment requests are undefined', () => {
    expect(buildPaymentRequests(undefined, 'GLOS')).toEqual([])
  })

  test('builds payment requests with the expected fields', () => {
    const paymentRequests = [{
      correlationId: 'correlation-id',
      schemeId: 'scheme-id',
      batch: 'batch-1',
      invoiceNumber: 'invoice-1',
      paymentRequestNumber: 'payment-request-1',
      frn: 1234567890,
      sbi: 987654321,
      claimDate: '2026-01-01',
      invoiceLines: [{ amount: 100 }]
    }]

    expect(buildPaymentRequests(paymentRequests, 'GLOS')).toEqual([{
      correlationId: 'correlation-id',
      sourceSystem: 'GLOS',
      schemeId: 'scheme-id',
      batch: 'batch-1',
      invoiceNumber: 'invoice-1',
      paymentRequestNumber: 'payment-request-1',
      frn: 1234567890,
      sbi: 987654321,
      claimDate: '2026-01-01',
      invoiceLines: [{ amount: 100 }]
    }])
  })

  test('defaults missing invoice lines to an empty array', () => {
    const paymentRequests = [
      { correlationId: 'undefined-lines' },
      { correlationId: 'null-lines', invoiceLines: null }
    ]

    expect(buildPaymentRequests(paymentRequests, 'GLOS')).toEqual([
      {
        correlationId: 'undefined-lines',
        sourceSystem: 'GLOS',
        invoiceLines: []
      },
      {
        correlationId: 'null-lines',
        sourceSystem: 'GLOS',
        invoiceLines: []
      }
    ])
  })

  test('preserves an empty invoice lines array', () => {
    const paymentRequests = [{ invoiceLines: [] }]

    expect(buildPaymentRequests(paymentRequests, 'GLOS')[0].invoiceLines).toEqual([])
  })

  test('maps multiple payment requests', () => {
    const paymentRequests = [
      { correlationId: 'first' },
      { correlationId: 'second' }
    ]

    expect(buildPaymentRequests(paymentRequests, 'GLOS')).toHaveLength(2)
    expect(buildPaymentRequests(paymentRequests, 'GLOS').map(request => request.correlationId))
      .toEqual(['first', 'second'])
  })
})
