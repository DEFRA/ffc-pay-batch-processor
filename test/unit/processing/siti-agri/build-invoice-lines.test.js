global.console.error = jest.fn()

const { buildInvoiceLines, isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

let paymentRequest

describe('Build invoice lines', () => {
  const baseInvoiceLine = () => ({
    schemeCode: 'SITIELM',
    accountCode: 'ABC123',
    fundCode: 'ABC12',
    agreementNumber: 'SIP123456789012',
    description: 'G00 - Gross value of claim',
    value: 100,
    convergence: true,
    deliveryBody: 'RP00',
    marketingYear: 2023
  })

  const createPaymentRequest = (overrides = {}) => ({
    invoiceLines: [structuredClone({ ...baseInvoiceLine(), ...overrides })]
  })

  beforeEach(() => {
    paymentRequest = createPaymentRequest()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('build invoice lines', async () => {
    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse).toMatchObject(paymentRequest.invoiceLines)
  })

  test('Successful validation of invoice lines', async () => {
    const result = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(result.result).toBe(true)
  })

  const invalidCases = [
    ['schemeCode must be string', { schemeCode: 123 }, 'Invoice line is invalid. "schemeCode" must be a string'],
    ['accountCode pattern invalid', { accountCode: 'ABC' }, 'Invoice line is invalid. "accountCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{3}$/'],
    ['fundCode pattern invalid', { fundCode: 'ABC' }, 'Invoice line is invalid. "fundCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{2}$/'],
    ['agreementNumber must be string', { agreementNumber: 1234 }, 'Invoice line is invalid. "agreementNumber" must be a string'],
    ['description pattern invalid', { description: 'Gross value of claim' }, 'Invoice line is invalid. "description" with value "Gross value of claim" fails to match the required pattern: /^[A-Z]\\d{2}\\s-\\s.+$/'],
    ['value must be number', { value: 'ABC' }, 'Invoice line is invalid. "value" must be a number'],
    ['convergence must be boolean', { convergence: 'Y' }, 'Invoice line is invalid. "convergence" must be a boolean'],
    ['deliveryBody pattern invalid', { deliveryBody: 'RP' }, 'Invoice line is invalid. "deliveryBody" with value "RP" fails to match the required pattern: /^[A-Z]{2}\\d{2}$/'],
    ['marketingYear must be number', { marketingYear: 'ABC' }, 'Invoice line is invalid. "marketingYear" must be a number']
  ]

  test.each(invalidCases)('Failed validation: %s', (_, overrides, expectedError) => {
    paymentRequest = createPaymentRequest(overrides)
    const result = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith(expectedError)
    expect(result.result).toBe(false)
  })

  test('should exclude net lines', async () => {
    paymentRequest.invoiceLines.push({
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      description: 'N00 - Net value of claim',
      value: 100,
      convergence: true,
      deliveryBody: 'RP00'
    })

    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse).toMatchObject([paymentRequest.invoiceLines[0]])
  })
})
