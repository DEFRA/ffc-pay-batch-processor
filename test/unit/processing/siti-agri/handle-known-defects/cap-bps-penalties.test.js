const { capBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties')
const { bps, sfi } = require('../../../../../app/schemes')
const { P02 } = require('../../../../../app/constants/line-descriptions')

describe('Correct BPS penalties', () => {
  let paymentRequest
  let P02InvoiceLine

  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))
    paymentRequest.sourceSystem = bps.sourceSystem

    P02InvoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
    P02InvoiceLine.description = P02
  })

  test('check test file is setup correctly', () => {
    const logSpy = jest.spyOn(global.console, 'log')
    capBPSPenalties(paymentRequest)
    expect(logSpy).toHaveBeenCalledWith('cap bps penalties')
  })

  test('Should return paymentRequest unchanged when scheme is not BPS', () => {
    paymentRequest.sourceSystem = sfi.sourceSystem
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return paymentRequest unchanged when scheme is BPS but invoice lines do not contain P02 or P04 penalty', () => {
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should reduce P02 value to -100 when Gross value is 100 and P02 value is -120', () => {
    P02InvoiceLine.value = -120
    paymentRequest.invoiceLines.push(P02InvoiceLine)

    const result = capBPSPenalties(paymentRequest)
    expect(result.invoiceLines[1].value).toBe(-100)
  })
})
