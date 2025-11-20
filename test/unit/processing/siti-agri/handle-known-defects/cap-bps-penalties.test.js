jest.mock('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')
const { recalculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')

const { P02, P04 } = require('../../../../../app/constants/line-descriptions')
const { bps, sfi } = require('../../../../../app/constants/schemes')
const { capBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties')

let paymentRequest
let invoiceLine

describe('Identify if BPS penalties need correcting', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../../mocks/payment-request').paymentRequest)
    paymentRequest.sourceSystem = bps.sourceSystem
    invoiceLine = structuredClone(require('../../../../mocks/invoice-lines').invoiceLines[0])
  })

  test('Should return unchanged paymentRequest when scheme is not BPS', () => {
    paymentRequest.sourceSystem = sfi.sourceSystem
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test('Should return unchanged paymentRequest when BPS scheme but no P02/P04 penalties', () => {
    const result = capBPSPenalties(paymentRequest)
    expect(result).toStrictEqual(paymentRequest)
  })

  test.each([
    ['P02 penalty', P02],
    ['P04 penalty', P04]
  ])('Should call recalculateBPSPenalties when payment request contains %s', (_, penalty) => {
    invoiceLine.description = `${penalty} - Example penalty`
    paymentRequest.invoiceLines.push(invoiceLine)
    capBPSPenalties(paymentRequest)
    expect(recalculateBPSPenalties).toHaveBeenCalled()
  })
})
