global.console.error = jest.fn()

const { sfi23, cs } = require('../../../../app/constants/schemes')
const { buildInvoiceLines, isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

let invoiceLines

describe('Build invoice lines', () => {
  beforeEach(() => {
    invoiceLines = [{
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
    const invoiceLinesParse = buildInvoiceLines(sfi23.schemeId, invoiceLines, 'C123')
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

  test('should overwrite agreement number for invoice lines to provided contract number if CS', async () => {
    const invoiceLinesParse = buildInvoiceLines(cs.schemeId, invoiceLines, 'C123')
    expect(invoiceLinesParse).toMatchObject([
      {
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        agreementNumber: 'C123',
        description: 'G00 - Gross value of claim',
        value: 100,
        convergence: true,
        deliveryBody: 'RP00',
        marketingYear: 2023
      }
    ])
  })

  test('Successful validation of invoice lines', async () => {
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(invoiceLineIsValid.result).toBe(true)
  })

  test('Failed validation of invoice lines for schemeCode', async () => {
    invoiceLines[0].schemeCode = 123
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "schemeCode" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for accountCode', async () => {
    invoiceLines[0].accountCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "accountCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{3}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for fundCode', async () => {
    invoiceLines[0].fundCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "fundCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for agreementNumber', async () => {
    invoiceLines[0].agreementNumber = 1234
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "agreementNumber" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for description', async () => {
    invoiceLines[0].description = 'Gross value of claim'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "description" with value "Gross value of claim" fails to match the required pattern: /^[A-Z]\\d{2}\\s-\\s.+$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for value', async () => {
    invoiceLines[0].value = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "value" must be a number')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for convergence', async () => {
    invoiceLines[0].convergence = 'Y'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "convergence" must be a boolean')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for deliveryBody', async () => {
    invoiceLines[0].deliveryBody = 'RP'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "deliveryBody" with value "RP" fails to match the required pattern: /^[A-Z]{2}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for marketingYear', async () => {
    invoiceLines[0].marketingYear = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "marketingYear" must be a number')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('should exclude net lines', async () => {
    invoiceLines.push({
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      description: 'N00 - Net value of claim',
      value: 100,
      convergence: true,
      deliveryBody: 'RP00'
    })
    const invoiceLinesParse = buildInvoiceLines(sfi23.schemeId, invoiceLines, 'C123')
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
