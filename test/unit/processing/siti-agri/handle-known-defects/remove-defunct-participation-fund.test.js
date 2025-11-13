const removeDefunctParticipationFund = require('../../../../../app/processing/siti-agri/handle-known-defects/remove-defunct-participation-fund')
const { sfiPilot } = require('../../../../../app/constants/schemes')

const GROSS_LINE_DESCRIPTION = 'G00 - Gross value of claim'
const PARTICIPATION_PAYMENT_SCHEME_CODE = '80009'

describe('Remove defunct participation fund', () => {
  const createPaymentRequest = (lines, sourceSystem = sfiPilot.sourceSystem, value = lines.reduce((sum, l) => sum + l.value, 0)) => ({
    sourceSystem,
    value,
    invoiceLines: structuredClone(lines)
  })

  const grossLine = (schemeCode, value) => ({ description: GROSS_LINE_DESCRIPTION, schemeCode, value })
  const reductionLine = (schemeCode, value) => ({ description: 'P24 - Over declaration reduction', schemeCode, value })

  test.each([
    ['removes defunct fund if no other gross values', [grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000), grossLine('80001', 0)], 0, true],
    ['removes defunct fund if no other invoice lines', [grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000)], 0, true],
    ['does not remove fund if other gross values', [grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000), grossLine('80001', 1000)], 6000, false],
    ['removes fund if other net values all zero', [grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000), grossLine('80001', 1000), reductionLine('80001', -1000)], 0, true],
    ['removes fund if multiple groups net values all zero', [
      grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000),
      grossLine('80001', 1000),
      reductionLine('80001', -1000),
      grossLine('80002', 2000),
      reductionLine('80002', -2000)
    ], 0, true],
    ['removes fund if multiple reductions', [
      grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000),
      grossLine('80001', 1000),
      reductionLine('80001', -500),
      grossLine('80001', -500)
    ], 0, true],
    ['removes fund if decimal values', [
      grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000),
      grossLine('80001', 0.3),
      reductionLine('80001', -0.1),
      reductionLine('80001', -0.2)
    ], 0, true]
  ])('%s', (_, invoiceLines, expectedValue, shouldRemoveFund) => {
    const paymentRequest = createPaymentRequest(invoiceLines)
    const updated = removeDefunctParticipationFund(paymentRequest)
    expect(updated.value).toBe(expectedValue)

    if (shouldRemoveFund) {
      expect(updated.invoiceLines[0].value).toBe(0)
    } else {
      expect(updated.invoiceLines[0].value).toBe(invoiceLines[0].value)
    }
  })

  test('does not remove fund if not SFI Pilot', () => {
    const invoiceLines = [grossLine(PARTICIPATION_PAYMENT_SCHEME_CODE, 5000), grossLine('80001', 0)]
    const paymentRequest = createPaymentRequest(invoiceLines, 'Something else')
    const updated = removeDefunctParticipationFund(paymentRequest)
    expect(updated.value).toBe(paymentRequest.value)
    expect(updated.invoiceLines[0].value).toBe(5000)
    expect(updated.invoiceLines[1].value).toBe(0)
  })
})
