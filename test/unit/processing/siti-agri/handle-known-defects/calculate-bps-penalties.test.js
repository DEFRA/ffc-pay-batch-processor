const { calculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/calculate-bps-penalties')

describe('Calculate the correct BPS penalties', () => {
  let paymentRequest
  let penaltyInvoiceLine
  let grossInvoiceLine

  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))

    penaltyInvoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    grossInvoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    penaltyInvoiceLine.description = 'P02 - Over declaration penalty'
    penaltyInvoiceLine.schemeCode = 10501
    grossInvoiceLine.schemeCode = 10501
  })

  test('test 1', () => {
    penaltyInvoiceLine.value = -50
    paymentRequest.invoiceLines.push(grossInvoiceLine)
    paymentRequest.invoiceLines.push(penaltyInvoiceLine)
    calculateBPSPenalties(paymentRequest)
  })

  test('Should reduce P02 value to -100 when Gross value is 100 and P02 value is -120', () => {
    grossInvoiceLine.value = 100
    penaltyInvoiceLine.value = -120
    paymentRequest.invoiceLines.push(grossInvoiceLine)
    paymentRequest.invoiceLines.push(penaltyInvoiceLine)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === 'P02 - Over declaration penalty')[0].value).toBe(-100)
  })
})
