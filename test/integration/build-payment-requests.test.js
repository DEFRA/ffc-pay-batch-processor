const { GBP } = require('../../app/currency')
const { Q4 } = require('../../app/schedules')
const { sfiPilot } = require('../../app/schemes')

const buildPaymentRequests = require('../../app/processing/siti-agri/build-payment-requests')

describe('Build payment requests', () => {
  let sourceSystem
  let paymentRequests
  let invoiceLines

  beforeEach(() => {
    sourceSystem = sfiPilot.sourceSystem
    invoiceLines = [{
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      description: 'G00 - Gross value of claim',
      value: 100,
      dueDate: '2022-11-02',
      marketingYear: 2022,
      agreementNumber: 'SIP123456789012'
    }]

    paymentRequests = [{
      sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100,
      deliveryBody: 'RP00',
      invoiceLines
    }]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('build payment requests', async () => {
    const paymentRequestsParse = buildPaymentRequests(paymentRequests, sourceSystem)

    const {
      dueDate,
      marketingYear,
      agreementNumber,
      ...remainingingInvoiceLines
    } = invoiceLines[0]

    expect(paymentRequestsParse).toMatchObject([{
      ...paymentRequests[0],
      correlationId: paymentRequestsParse[0].correlationId,
      agreementNumber,
      dueDate,
      marketingYear,
      invoiceLines: [remainingingInvoiceLines]
    }])
  })
})
