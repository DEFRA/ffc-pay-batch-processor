const { P01, P02, P04, G00 } = require('../../../../../app/constants/line-descriptions')

const { calculateGrossAfterPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/calculate-gross-after-penalties')

const schemeCode = 10501

let invoiceLinesByScheme
let invoiceLine

describe('Calculate the correct BPS penalties', () => {
  const addInvoiceLine = (description, schemeCode, value) => {
    invoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    invoiceLine.description = description
    invoiceLine.schemeCode = schemeCode
    invoiceLine.value = value
    invoiceLinesByScheme.push(invoiceLine)
  }
  beforeEach(() => {
    invoiceLinesByScheme = []
    addInvoiceLine(G00, schemeCode, 100)
  })

  test('Should return total of gross - penalty line when only one penalty invoice line.', () => {
    addInvoiceLine(P02, schemeCode, -10)
    const result = calculateGrossAfterPenalties(invoiceLinesByScheme)
    expect(result).toBe(90)
  })

  test('Should return total of gross - all penalty lines when multiple penalty lines.', () => {
    addInvoiceLine(P01, schemeCode, -10)
    addInvoiceLine(P02, schemeCode, -10)
    addInvoiceLine(P04, schemeCode, -10)
    const result = calculateGrossAfterPenalties(invoiceLinesByScheme)
    expect(result).toBe(70)
  })

  test('Should not include non penalty lines in penalty total and return total of gross - all penalty lines.', () => {
    addInvoiceLine(P02, schemeCode, -10)
    addInvoiceLine('Not a penalty line', schemeCode, -10)
    const result = calculateGrossAfterPenalties(invoiceLinesByScheme)
    expect(result).toBe(90)
  })
})
