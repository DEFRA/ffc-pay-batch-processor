const handleKnownDefects = require('../../../../app/processing/siti-agri/handle-known-defects')
const { sfiPilot } = require('../../../../app/schemes')
const GROSS_LINE_DESCRIPTION = 'G00 - Gross value of claim'
const PARTICIPATION_PAYMENT_SCHEME_CODE = '80009'

describe('Handle known defects', () => {
  test('removes defunct participation fund if no other gross values', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
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
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    updatedPaymentRequest.invoiceLines.forEach(invoiceLine => {
      expect(invoiceLine.value).toBe(0)
    })
  })

  test('removes defunct participation fund if no other invoice lines', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }]
    }
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    updatedPaymentRequest.invoiceLines.forEach(invoiceLine => {
      expect(invoiceLine.value).toBe(0)
    })
  })

  test('does not remove participation fund if other gross values', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
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
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(6000)
  })

  test('removes defunct participation fund if other net values all zero', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 1000
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80001',
        value: -1000
      }]
    }
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[0].value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[1].value).toBe(1000)
    expect(updatedPaymentRequest.invoiceLines[2].value).toBe(-1000)
  })

  test('removes defunct participation fund if multiple groups net values all zero', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 1000
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80001',
        value: -1000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80002',
        value: 2000
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80002',
        value: -2000
      }]
    }
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[0].value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[1].value).toBe(1000)
    expect(updatedPaymentRequest.invoiceLines[2].value).toBe(-1000)
    expect(updatedPaymentRequest.invoiceLines[3].value).toBe(2000)
    expect(updatedPaymentRequest.invoiceLines[4].value).toBe(-2000)
  })

  test('removes defunct participation fund if multiple reductions', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 1000
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80001',
        value: -500
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: -500
      }]
    }
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[0].value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[1].value).toBe(1000)
    expect(updatedPaymentRequest.invoiceLines[2].value).toBe(-500)
    expect(updatedPaymentRequest.invoiceLines[3].value).toBe(-500)
  })

  test('removes defunct participation fund if decimal values', () => {
    const paymentRequest = {
      sourceSystem: sfiPilot.sourceSystem,
      value: 5000,
      invoiceLines: [{
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: PARTICIPATION_PAYMENT_SCHEME_CODE,
        value: 5000
      }, {
        description: GROSS_LINE_DESCRIPTION,
        schemeCode: '80001',
        value: 0.30
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80001',
        value: -0.10
      }, {
        description: 'P24 - Over declaration reduction',
        schemeCode: '80001',
        value: -0.20
      }]
    }
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[0].value).toBe(0)
    expect(updatedPaymentRequest.invoiceLines[1].value).toBe(0.30)
    expect(updatedPaymentRequest.invoiceLines[2].value).toBe(-0.10)
    expect(updatedPaymentRequest.invoiceLines[3].value).toBe(-0.20)
  })

  test('does not remove defunct participation fund if not SFI Pilot', () => {
    const paymentRequest = {
      sourceSystem: 'Something else',
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
    const updatedPaymentRequest = handleKnownDefects(paymentRequest)
    expect(updatedPaymentRequest.value).toBe(paymentRequest.value)
    expect(updatedPaymentRequest.invoiceLines[0].value).toBe(5000)
    expect(updatedPaymentRequest.invoiceLines[1].value).toBe(0)
  })
})
