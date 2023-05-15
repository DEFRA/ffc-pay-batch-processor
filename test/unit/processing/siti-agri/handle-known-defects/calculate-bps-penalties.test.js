const { calculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/calculate-bps-penalties')
const { P01, P02, P04, G00 } = require('../../../../../app/constants/line-descriptions')
describe('Calculate the correct BPS penalties', () => {
  let paymentRequest
  let invoiceLine

  const addInvoiceLine = (description, schemeCode, value) => {
    invoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    invoiceLine.description = description
    invoiceLine.schemeCode = schemeCode
    invoiceLine.value = value
    paymentRequest.invoiceLines.push(invoiceLine)
  }

  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))
    paymentRequest.invoiceLines = []
  })

  test('Should reduce P02 value to -100 when Gross value is 100 and P02 value is -120', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P02, 10501, -120)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P02)[0].value).toBe(-100)
  })

  test('Should reduce P02 value to -50 when Gross value is 100, P01 value is -50 and P02 value is -60', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P01, 10501, -50)
    addInvoiceLine(P02, 10501, -60)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P02)[0].value).toBe(-50)
  })

  test('Should not reduce P02 value when Gross value is 100 and P02 value is -50', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P02, 10501, -50)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P02)[0].value).toBe(-50)
  })

  test('Should reduce P04 value to -100 when Gross value is 100 and P04 value is -120', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P04, 10501, -120)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(-100)
  })

  test('Should reduce P04 value to -50 when Gross value is 100, P01 value is -50 and P04 value is -60', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P01, 10501, -50)
    addInvoiceLine(P04, 10501, -60)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(-50)
  })

  test('Should not reduce P04 value when Gross value is 100 and P04 value is -50', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P04, 10501, -50)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(-50)
  })

  test('Should reduce P04 value to -50 when Gross value is 100, P02 value is -50 and P04 value -60', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P02, 10501, -50)
    addInvoiceLine(P04, 10501, -60)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(-50)
  })

  test('Should reduce P04 value to -40 when Gross value is 100, P02 value is -60 and P04 value -60', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P02, 10501, -60)
    addInvoiceLine(P04, 10501, -60)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(-40)
  })

  test('Should reduce P02 value to -100 and reduce P04 value to 0 when Gross value is 100, P02 value is -120 and P04 value -120', () => {
    addInvoiceLine(G00, 10501, 100)
    addInvoiceLine(P02, 10501, -120)
    addInvoiceLine(P04, 10501, -120)

    const result = calculateBPSPenalties(paymentRequest)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)[0].value).toBe(0)
    expect(result.invoiceLines.filter(invoiceLine => invoiceLine.description === P02)[0].value).toBe(-100)
  })
})
