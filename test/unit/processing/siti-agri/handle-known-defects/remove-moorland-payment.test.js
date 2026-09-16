const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const { removeMoorlandPayment } = require('../../../../../app/processing/siti-agri/handle-known-defects/remove-moorland-payment')
const { MOORLAND_SCHEME_CODE } = require('../../../../../app/constants/scheme-codes')

const { SFI } = getSourceSystems()
const { SFI_EXPANDED } = getSchemeIds()

describe('Remove moorland payments', () => {
  const grossLine = (schemeCode, value = 0) => ({
    description: 'G00 - Gross value of claim',
    schemeCode,
    value
  })

  const reductionLine = (schemeCode, value = 0) => ({
    description: 'P24 - Over declaration reduction',
    schemeCode,
    value
  })

  const createPaymentRequest = (sourceSystem, lines) => ({
    sourceSystem,
    schemeId: sourceSystem === SFI ? SFI_EXPANDED : undefined,
    value: lines.reduce((sum, line) => sum + (line.value ?? 0), 0),
    invoiceLines: structuredClone(lines)
  })

  test.each([
    'removes moorland payment with one zero value invoice line',
    'removes moorland payment when other lines net zero',
    'removes moorland payment with multiple reductions',
    'removes moorland payment with multiple groups net zero',
    'removes moorland payment with decimal values'
  ])('%s', (testName) => {
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)

    let invoiceLines

    switch (testName) {
      case 'removes moorland payment with one zero value invoice line':
        invoiceLines = [grossLine('80001'), moorlandInvoiceLine]
        break
      case 'removes moorland payment when other lines net zero':
        invoiceLines = [
          grossLine('80001', 500),
          grossLine('80001', -500),
          moorlandInvoiceLine
        ]
        break
      case 'removes moorland payment with multiple reductions':
        invoiceLines = [
          grossLine('80001', 500),
          grossLine('80001', -250),
          reductionLine('80001', -250),
          moorlandInvoiceLine
        ]
        break
      case 'removes moorland payment with multiple groups net zero':
        invoiceLines = [
          grossLine('80001'),
          moorlandInvoiceLine,
          grossLine('80002', 500),
          grossLine('80002', -500)
        ]
        break
      case 'removes moorland payment with decimal values':
        invoiceLines = [
          grossLine('80001', 500.10),
          grossLine('80001', -500.10),
          moorlandInvoiceLine
        ]
        break
    }

    const paymentRequest = createPaymentRequest(SFI, invoiceLines)
    const result = removeMoorlandPayment(paymentRequest)

    expect(result.value).toBe(0)
    expect(
      result.invoiceLines.find(line => line.schemeCode === MOORLAND_SCHEME_CODE).value
    ).toBe(0)
  })

  test('does not remove moorland payment if another non-zero value is present', () => {
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)
    const paymentRequest = createPaymentRequest(SFI, [
      moorlandInvoiceLine,
      grossLine('80001', 500)
    ])

    const result = removeMoorlandPayment(paymentRequest)

    expect(result.value).toBe(765)
    expect(
      result.invoiceLines.find(line => line.schemeCode === MOORLAND_SCHEME_CODE).value
    ).toBe(265)
  })

  test('does not remove moorland payment for a different source system', () => {
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)
    const paymentRequest = createPaymentRequest('SFI23', [
      grossLine('80001'),
      moorlandInvoiceLine
    ])

    const result = removeMoorlandPayment(paymentRequest)

    expect(result).toStrictEqual(paymentRequest)
  })

  test('does not alter payment request if there is no moorland payment', () => {
    const paymentRequest = createPaymentRequest(SFI, [
      grossLine('80001', 500),
      grossLine('80001', -500)
    ])

    paymentRequest.value = 0

    const result = removeMoorlandPayment(paymentRequest)

    expect(result).toStrictEqual(paymentRequest)
  })
})
