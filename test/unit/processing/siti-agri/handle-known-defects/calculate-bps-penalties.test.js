const { calculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/calculate-bps-penalties')
const { P01, P02 } = require('../../../../../app/constants/penalty-descriptions')
describe('Calculate the correct BPS penalties', () => {
  let paymentRequest
  let penaltyInvoiceLine
  let grossInvoiceLine

  const addInvoiceLine = (description, schemeCode, value) => {
    penaltyInvoiceLine.description = description
    penaltyInvoiceLine.schemeCode = schemeCode
    penaltyInvoiceLine.value = value
    paymentRequest.invoiceLines.push(penaltyInvoiceLine)
  }

  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))

    penaltyInvoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    grossInvoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    grossInvoiceLine.schemeCode = 10501

    paymentRequest.invoiceLines = []
  })

  test('Should reduce P02 value to -100 when Gross value is 100 and P02 value is -120', () => {
    grossInvoiceLine.value = 100
    addInvoiceLine(P02, 10501, -120)
    paymentRequest.invoiceLines.push(grossInvoiceLine)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === 'P02 - Over declaration penalty')[0].value).toBe(-100)
  })

  test('Should reduce P02 value to -50 when Gross value is 100, P01 value is -50 and P02 value is -60', () => {
    grossInvoiceLine.value = 100
    paymentRequest.invoiceLines.push(grossInvoiceLine)
    addInvoiceLine(P01, 10501, -60)
    addInvoiceLine(P02, 10501, -50)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === 'P02 - Over declaration penalty')[0].value).toBe(-50)
  })

  test('Should not reduce P02 value when Gross value is 100 and P02 value is -50', () => {
    grossInvoiceLine.value = 100
    paymentRequest.invoiceLines.push(grossInvoiceLine)
    addInvoiceLine(P01, 10501, -60)
    addInvoiceLine(P02, 10501, -50)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === 'P02 - Over declaration penalty')[0].value).toBe(-50)
  })
})
