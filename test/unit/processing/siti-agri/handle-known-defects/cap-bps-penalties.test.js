jest.mock('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')
const { recalculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')

const { P02, P04 } = require('../../../../../app/constants/line-descriptions')

const { bps, sfi } = require('../../../../../app/schemes')
const { capBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties')

let paymentRequest
let invoiceLine

describe('Identify if bps penalties need correcting', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../../../mocks/payment-request').paymentRequest))
    paymentRequest.sourceSystem = bps.sourceSystem

    invoiceLine = JSON.parse(JSON.stringify(require('../../../../mocks/invoice-lines').invoiceLines[0]))
  })

  test('Should return unchanged paymentRequest when scheme is not BPS', () => {
    paymentRequest.sourceSystem = sfi.sourceSystem
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged paymentRequest when scheme is BPS but invoice lines do not contain P02 or P04 penalty', () => {
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should call recalculateBPSPenalties when payment request contains a P02 penalty', () => {
    invoiceLine.description = P02
    paymentRequest.invoiceLines.push(invoiceLine)
    capBPSPenalties(paymentRequest)
    expect(recalculateBPSPenalties).toHaveBeenCalled()
  })

  test('Should call recalculateBPSPenalties when payment request contains a P04 penalty', () => {
    invoiceLine.description = P04
    paymentRequest.invoiceLines.push(invoiceLine)
    capBPSPenalties(paymentRequest)
    expect(recalculateBPSPenalties).toHaveBeenCalled()
  })
})
