const { sfi, sfi23 } = require('../../../../../app/constants/schemes')
const { removeMoorlandPayment } = require('../../../../../app/processing/siti-agri/handle-known-defects/remove-moorland-payment')
const { MOORLAND_SCHEME_CODE } = require('../../../../../app/constants/scheme-codes')

describe('Remove moorland payments', () => {
  const grossLine = (schemeCode, value = 0) => ({ description: 'G00 - Gross value of claim', schemeCode, value })
  const reductionLine = (schemeCode, value = 0) => ({ description: 'P24 - Over declaration reduction', schemeCode, value })

  const createPaymentRequest = (sourceSystem, lines) => ({
    sourceSystem,
    schemeId: sourceSystem === sfi.sourceSystem ? sfi.schemeId : undefined,
    value: lines.reduce((sum, l) => sum + (l.value ?? 0), 0),
    invoiceLines: structuredClone(lines)
  })

  test.each([
    'removes moorland payment with one zero value invoice line',
    'removes moorland payment when other lines net zero',
    'removes moorland payment with multiple reductions',
    'removes moorland payment with multiple groups net zero',
    'removes moorland payment with decimal values'
  ])('%s', (testName) => {
    // Create fresh lines inside each test
    const baseInvoiceLine = grossLine('80001', 0)
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)

    let invoiceLines
    switch (testName) {
      case 'removes moorland payment with one zero value invoice line':
        invoiceLines = [baseInvoiceLine, moorlandInvoiceLine]
        break
      case 'removes moorland payment when other lines net zero':
        invoiceLines = [grossLine('80001', 500), grossLine('80001', -500), moorlandInvoiceLine]
        break
      case 'removes moorland payment with multiple reductions':
        invoiceLines = [grossLine('80001', 500), grossLine('80001', -250), reductionLine('80001', -250), moorlandInvoiceLine]
        break
      case 'removes moorland payment with multiple groups net zero':
        invoiceLines = [baseInvoiceLine, moorlandInvoiceLine, grossLine('80002', 500), grossLine('80002', -500)]
        break
      case 'removes moorland payment with decimal values':
        invoiceLines = [grossLine('80001', 500.10), grossLine('80001', -500.10), moorlandInvoiceLine]
        break
    }

    const paymentRequest = createPaymentRequest(sfi.sourceSystem, invoiceLines)
    const updated = removeMoorlandPayment(paymentRequest)

    expect(updated.value).toBe(0)
    expect(updated.invoiceLines.find(line => line.schemeCode === MOORLAND_SCHEME_CODE).value).toBe(0)
  })

  test('does not remove moorland payment if other gross value present', () => {
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)
    const paymentRequest = createPaymentRequest(sfi.sourceSystem, [moorlandInvoiceLine, grossLine('80001', 500)])
    paymentRequest.value = 765
    const updated = removeMoorlandPayment(paymentRequest)
    expect(updated.value).toBe(765)
    expect(updated.invoiceLines.find(line => line.schemeCode === MOORLAND_SCHEME_CODE).value).toBe(265)
  })

  test('does not remove moorland payment for SFI23', () => {
    const moorlandInvoiceLine = grossLine(MOORLAND_SCHEME_CODE, 265)
    const baseInvoiceLine = grossLine('80001', 0)
    const paymentRequest = createPaymentRequest(sfi23.sourceSystem, [baseInvoiceLine, moorlandInvoiceLine])
    const updated = removeMoorlandPayment(paymentRequest)
    expect(updated).toStrictEqual(paymentRequest)
  })

  test('does not alter payment request if no moorland payment', () => {
    const paymentRequest = createPaymentRequest(sfi.sourceSystem, [grossLine('80001', 500), grossLine('80001', -500)])
    paymentRequest.value = 0
    const updated = removeMoorlandPayment(paymentRequest)
    expect(updated).toStrictEqual(paymentRequest)
  })
})
