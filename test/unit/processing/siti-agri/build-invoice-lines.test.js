global.console.error = jest.fn()

const { cs } = require('../../../../app/constants/schemes')
const { buildInvoiceLines, isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

let paymentRequest

describe('Build invoice lines', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../mocks/payment-request').paymentRequest))
    paymentRequest.invoiceLines = [{
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      agreementNumber: 'SIP123456789012',
      description: 'G00 - Gross value of claim',
      value: 100,
      convergence: true,
      deliveryBody: 'RP00',
      marketingYear: 2023
    }]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('build invoice lines', async () => {
    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse).toMatchObject([
      {
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        agreementNumber: 'SIP123456789012',
        description: 'G00 - Gross value of claim',
        value: 100,
        convergence: true,
        deliveryBody: 'RP00',
        marketingYear: 2023
      }
    ])
  })

  test('should not overwrite agreement number for invoice lines to provided contract number if not CS', async () => {
    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse[0].agreementNumber).toBe(paymentRequest.invoiceLines[0].agreementNumber)
  })

  test('should overwrite agreement number for invoice lines to header level contract number if CS', async () => {
    paymentRequest.schemeId = cs.schemeId
    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse[0].agreementNumber).toBe(paymentRequest.contractNumber)
  })

  test('should overwrite delivery body for invoice lines to header level delivery body if CS', async () => {
    paymentRequest.schemeId = cs.schemeId
    const invoiceLinesParse = buildInvoiceLines(paymentRequest)
    expect(invoiceLinesParse[0].deliveryBody).toBe(paymentRequest.deliveryBody)
  })

  test('Successful validation of invoice lines', async () => {
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(invoiceLineIsValid.result).toBe(true)
  })

  test('Failed validation of invoice lines for schemeCode', async () => {
    paymentRequest.invoiceLines[0].schemeCode = 123
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "schemeCode" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for accountCode', async () => {
    paymentRequest.invoiceLines[0].accountCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "accountCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{3}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for fundCode', async () => {
    paymentRequest.invoiceLines[0].fundCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "fundCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for agreementNumber', async () => {
    paymentRequest.invoiceLines[0].agreementNumber = 1234
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "agreementNumber" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for description', async () => {
    paymentRequest.invoiceLines[0].description = 'Gross value of claim'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "description" with value "Gross value of claim" fails to match the required pattern: /^[A-Z]\\d{2}\\s-\\s.+$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for value', async () => {
    paymentRequest.invoiceLines[0].value = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "value" must be a number')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for convergence', async () => {
    paymentRequest.invoiceLines[0].convergence = 'Y'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "convergence" must be a boolean')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for deliveryBody', async () => {
    paymentRequest.invoiceLines[0].deliveryBody = 'RP'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "deliveryBody" with value "RP" fails to match the required pattern: /^[A-Z]{2}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for marketingYear', async () => {
    paymentRequest.invoiceLines[0].marketingYear = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(paymentRequest.invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "marketingYear" must be a number')
    expect(invoiceLineIsValid.result).toBe(false)
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
    expect(invoiceLinesParse).toMatchObject([
      {
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        description: 'G00 - Gross value of claim',
        value: 100,
        convergence: true,
        deliveryBody: 'RP00'
      }
    ])
  })
})
