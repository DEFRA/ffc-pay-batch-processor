const handleSitiDefects = require('../../app/parse-siti-payment-file/handle-siti-defects')
const GROSS_LINE_DESCRIPTION = 'G00 - Gross value of claim'
const PARTICIPATION_PAYMENT_SCHEME_CODE = '80009'

describe('Handle Siti Agri defects', () => {
  test('removes defunct participation fund if no other gross values', () => {
    const paymentRequest = {
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 0
      }]
    }
    const updatedPaymentRequest = handleSitiDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    updatedPaymentRequest.invoiceLines.forEach(invoiceLine => {
      expect(invoiceLine.value).toBe(0)
    })
  })

  test('removes defunct participation fund if no other invoice lines', () => {
    const paymentRequest = {
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }]
    }
    const updatedPaymentRequest = handleSitiDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    updatedPaymentRequest.invoiceLines.forEach(invoiceLine => {
      expect(invoiceLine.value).toBe(0)
    })
  })

  test('does not remove participation fund if other gross values', () => {
    const paymentRequest = {
      value: 6000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 1000
      }]
    }
    const updatedPaymentRequest = handleSitiDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(6000)
  })
})
