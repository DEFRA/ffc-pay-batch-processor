const { P01, P02, P04, G00 } = require('../../../../../app/constants/line-descriptions')
const { recalculateBPSPenalties } = require('../../../../../app/processing/siti-agri/handle-known-defects/cap-bps-penalties/recalculate-bps-penalties')

let paymentRequest

describe('Recalculate BPS penalties', () => {
  const addInvoiceLine = (description, schemeCode, value) => {
    const invoiceLine = structuredClone(require('../../../../mocks/invoice-lines').invoiceLines[0])
    invoiceLine.description = description
    invoiceLine.schemeCode = schemeCode
    invoiceLine.value = value
    paymentRequest.invoiceLines.push(invoiceLine)
  }

  const getLineValue = (schemeCode, description) =>
    paymentRequest.invoiceLines.find(line => line.schemeCode === schemeCode && line.description === description)?.value

  beforeEach(() => {
    paymentRequest = structuredClone(require('../../../../mocks/payment-request').paymentRequest)
    paymentRequest.invoiceLines = []
  })

  test.each([
    ['P02 only exceeds gross', P02, 10501, -120, -100],
    ['P02 below gross', P02, 10501, -50, -50],
    ['P02 with P01 present', P02, 10501, -60, -50, [{ description: P01, value: -50 }]],
    ['P04 only exceeds gross', P04, 10501, -120, -100],
    ['P04 below gross', P04, 10501, -50, -50],
    ['P04 adjusted due to P02', P04, 10501, -60, -50, [{ description: P02, value: -50 }]],
    ['P04 adjusted due to P02 larger', P04, 10501, -60, -40, [{ description: P02, value: -60 }]],
    ['P02 and P04 both exceed gross', [P02, P04], 10501, [-120, -120], [-100, 0]]
  ])('%s', (_, descriptions, schemeCode, inputValues, expectedValues, preLines = []) => {
    addInvoiceLine(G00, schemeCode, 100)

    preLines.forEach(line => addInvoiceLine(line.description, schemeCode, line.value))

    if (Array.isArray(descriptions)) {
      descriptions.forEach((desc, i) => addInvoiceLine(desc, schemeCode, inputValues[i]))
    } else {
      addInvoiceLine(descriptions, schemeCode, inputValues)
    }

    const result = recalculateBPSPenalties(paymentRequest)

    if (Array.isArray(descriptions)) {
      descriptions.forEach((desc, i) => {
        const value = result.invoiceLines.find(line => line.schemeCode === schemeCode && line.description === desc)?.value
        expect(value).toBe(expectedValues[i])
      })
    } else {
      const value = result.invoiceLines.find(line => line.schemeCode === schemeCode && line.description === descriptions)?.value
      expect(value).toBe(expectedValues)
    }
  })

  test('Multiple schemes handled independently', () => {
    const schemes = [10501, 10502]
    schemes.forEach(scheme => {
      addInvoiceLine(G00, scheme, 100)
      addInvoiceLine(P02, scheme, -120)
      addInvoiceLine(P04, scheme, -120)
    })

    recalculateBPSPenalties(paymentRequest)

    schemes.forEach(scheme => {
      expect(getLineValue(scheme, P02)).toBe(-100)
      expect(getLineValue(scheme, P04)).toBe(0)
    })
  })
})
