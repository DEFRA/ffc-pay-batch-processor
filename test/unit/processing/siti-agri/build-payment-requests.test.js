const { GBP } = require('../../../../app/currency')
const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')
const { Q4 } = require('../../../../app/schedules')
const { sfiPilot } = require('../../../../app/schemes')

global.console.error = jest.fn()

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
      sourceSystem: sfiPilot.sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100000,
      deliveryBody: 'RP00',
      invoiceLines
    }]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('build payment requests', async () => {
    const paymentRequestsParse = buildPaymentRequests(paymentRequests, sourceSystem)
    expect(paymentRequestsParse).toMatchObject([{
      sourceSystem: sfiPilot.sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100000,
      deliveryBody: 'RP00',
      agreementNumber: 'SIP123456789012',
      dueDate: '2022-11-02',
      correlationId: paymentRequestsParse[0].correlationId,
      invoiceLines: [{
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        description: 'G00 - Gross value of claim',
        value: 100
      }]
    }])
  })

  test('Validation error in payment requests with no sourceSystem', async () => {
    sourceSystem = undefined
    buildPaymentRequests(paymentRequests)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "sourceSystem" is required')
  })

  test('Validation error in payment requests with no invoiceNumber', async () => {
    delete paymentRequests[0].invoiceNumber
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "invoiceNumber" is required')
  })

  test('Validation error in payment requests with no contractNumber', async () => {
    delete paymentRequests[0].contractNumber
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "contractNumber" is required')
  })

  test('Validation error in payment requests with no value', async () => {
    delete paymentRequests[0].value
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "value" is required')
  })

  test('Validation error in payment requests with invalid frn', async () => {
    paymentRequests[0].frn = 1
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "frn" must be greater than or equal to 1000000000')
  })

  test('Validation error in payment requests with invalid marketingYear', async () => {
    paymentRequests[0].invoiceLines[0].marketingYear = 2014
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "marketingYear" must be greater than 2015')
  })

  test('Validation error in payment requests with invalid currency', async () => {
    paymentRequests[0].currency = 'US'
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "currency" must be one of [GBP, EUR]')
  })

  test('Validation error in payment requests with invalid schedule', async () => {
    paymentRequests[0].schedule = '4'
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "schedule" must be one of [Q4, M12, T4]')
  })

  test('Validation error in payment requests with invalid dueDate', async () => {
    paymentRequests[0].invoiceLines[0].dueDate = '01/11/2022'
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(console.error).toHaveBeenLastCalledWith('Payment request is invalid. "dueDate" must be in YYYY-MM-DD format')
  })
})
