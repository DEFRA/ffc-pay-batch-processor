const { sfi } = require('../../../../../app/constants/schemes')
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
      value: 250
    }

    paymentRequest = {
      ...paymentRequest,
      sourceSystem: sfi.sourceSystem,
      schemeId: sfi.schemeId,
      value: 250,
      invoiceLines: [invoiceLine, moorlandInvoiceLine]
    }
  })

  test('removes moorland payment', () => {
    const result = removeMoorlandPayments(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })
})
