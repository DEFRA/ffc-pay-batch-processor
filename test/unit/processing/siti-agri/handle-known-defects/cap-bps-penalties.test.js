jest.mock('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')
const { recalculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')

const { getSourceSystems } = require('ffc-pay-schemes')
const { P02, P04 } = require('../../../../../app/constants/line-descriptions')
const { capBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties')

const { BPS: BPS_SOURCE_SYSTEM, SFI: SFI_SOURCE_SYSTEM } = getSourceSystems()

let paymentRequest
let invoiceLine

describe('Identify if BPS penalties need correcting', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    paymentRequest = structuredClone(require('../../../../mocks/payment-request').paymentRequest)
    paymentRequest.sourceSystem = BPS_SOURCE_SYSTEM
    invoiceLine = structuredClone(require('../../../../mocks/invoice-lines').invoiceLines[0])
  })

  test('should return unchanged paymentRequest when source system is not BPS', () => {
    paymentRequest.sourceSystem = SFI_SOURCE_SYSTEM

    const result = capBPSPenalties(paymentRequest)

    expect(result).toStrictEqual(paymentRequest)
  })

  test('should return unchanged paymentRequest when BPS source system has no P02/P04 penalties', () => {
    const result = capBPSPenalties(paymentRequest)

    expect(result).toStrictEqual(paymentRequest)
  })

  test.each([
    ['P02 penalty', P02],
    ['P04 penalty', P04]
  ])('should call recalculateBPSPenalties when payment request contains %s', (_, penalty) => {
    invoiceLine.description = `${penalty} - Example penalty`
    paymentRequest.invoiceLines.push(invoiceLine)

    capBPSPenalties(paymentRequest)

    expect(recalculateBPSPenalties).toHaveBeenCalledWith(paymentRequest)
  })
})
