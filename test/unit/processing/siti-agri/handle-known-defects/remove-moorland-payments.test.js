const { sfi, sfi23 } = require('../../../../../app/constants/schemes')
const { removeMoorlandPayments } = require('../../../../../app/processing/siti-agri/handle-known-defects/remove-moorland-payments')
const moorlandSchemeCode = '80190'

let paymentRequest
let invoiceLine
let moorlandInvoiceLine

describe('Remove moorland payments', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))
    invoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').mappedInvoiceLines[0]))

    invoiceLine = {
      ...invoiceLine,
      schemeCode: '80001',
      value: 0
    }

    moorlandInvoiceLine = {
      ...invoiceLine,
      schemeCode: moorlandSchemeCode,
      value: 265
    }

    paymentRequest = {
      ...paymentRequest,
      sourceSystem: sfi.sourceSystem,
      schemeId: sfi.schemeId,
      value: 265,
      invoiceLines: [invoiceLine, moorlandInvoiceLine]
    }
  })

  test('removes moorland payment when sourceSystem is SFI22 and one zero value invoice line', () => {
    const updatedPaymentRequest = removeMoorlandPayments(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines.find(invoiceLine => invoiceLine.schemeCode === moorlandSchemeCode).value).toBe(0)
  })

  test('removes moorland payment when sourceSystem is SFI22 and two invoice lines with 0 total', () => {
    paymentRequest.invoiceLines = [{ ...invoiceLine, value: 500 }, { ...invoiceLine, value: -500 }, moorlandInvoiceLine]
    const updatedPaymentRequest = removeMoorlandPayments(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines.find(invoiceLine => invoiceLine.schemeCode === moorlandSchemeCode).value).toBe(0)
  })

  test('does not remove moorland payment when sourceSystem is SFI23', () => {
    paymentRequest.sourceSystem = sfi23.sourceSystem
    const updatedPaymentRequest = removeMoorlandPayments(paymentRequest)
    expect(updatedPaymentRequest).toStrictEqual(paymentRequest)
  })
})
