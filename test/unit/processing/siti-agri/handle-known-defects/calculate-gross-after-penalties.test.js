const { P01, P02, P04, G00 } = require('../../../../../app/constants/line-descriptions')
const { calculateGrossAfterPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/calculate-gross-after-penalties')

const schemeCode = 10501

let invoiceLinesByScheme
let invoiceLine

describe('Calculate the correct BPS penalties', () => {
  const addInvoiceLine = (description, schemeCode, value) => {
    invoiceLine = structuredClone(require('../../../../mocks/invoice-lines').invoiceLines[0])
    invoiceLine.description = description
    invoiceLine.schemeCode = schemeCode
    invoiceLine.value = value
    invoiceLinesByScheme.push(invoiceLine)
  }

  beforeEach(() => {
    invoiceLinesByScheme = []
    addInvoiceLine(G00, schemeCode, 100) // gross line
  })

  test.each([
    ['single penalty line', [[P02, -10]], 90],
    ['multiple penalty lines', [[P01, -10], [P02, -10], [P04, -10]], 70],
    ['mixed penalty and non-penalty lines', [[P02, -10], ['Not a penalty line', -10]], 90]
  ])('%s', (_, penalties, expected) => {
    penalties.forEach(([desc, val]) => addInvoiceLine(desc, schemeCode, val))
    const result = calculateGrossAfterPenalties(invoiceLinesByScheme)
    expect(result).toBe(expected)
  })
})
