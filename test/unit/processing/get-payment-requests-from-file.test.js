jest.mock('node:readline', () => ({
  createInterface: jest.fn()
}))

jest.mock('../../../app/processing/genesis/get-payment-requests', () => ({
  getPaymentRequestsFromGenesisFile: jest.fn()
}))

jest.mock('../../../app/processing/glos/get-payment-requests', () => jest.fn())

jest.mock('../../../app/processing/imps/get-payment-requests', () => ({
  getPaymentRequestsFromImpsFile: jest.fn()
}))

jest.mock('../../../app/processing/siti-agri/get-payment-requests', () => jest.fn())

const readline = require('node:readline')
const { getSchemeIds } = require('ffc-pay-schemes')
const { getPaymentRequestsFromGenesisFile } = require('../../../app/processing/genesis/get-payment-requests')
const getPaymentRequestsFromGlosFile = require('../../../app/processing/glos/get-payment-requests')
const { getPaymentRequestsFromImpsFile } = require('../../../app/processing/imps/get-payment-requests')
const getPaymentRequestsFromSitiAgriFile = require('../../../app/processing/siti-agri/get-payment-requests')
const getPaymentRequestsFromFile = require('../../../app/processing/get-payment-requests-from-file')

const { ES, FC, IMPS } = getSchemeIds()

describe('getPaymentRequestsFromFile', () => {
  const fileBuffer = Buffer.from('test file')
  const filename = 'payment-file.dat'
  const readBatchLines = {}
  const paymentRequests = [{ invoiceNumber: '12345' }]

  beforeEach(() => {
    jest.clearAllMocks()

    readline.createInterface.mockReturnValue(readBatchLines)

    getPaymentRequestsFromGenesisFile.mockReturnValue(paymentRequests)
    getPaymentRequestsFromGlosFile.mockReturnValue(paymentRequests)
    getPaymentRequestsFromImpsFile.mockReturnValue(paymentRequests)
    getPaymentRequestsFromSitiAgriFile.mockReturnValue(paymentRequests)
  })

  test.each([
    ['Genesis', ES, getPaymentRequestsFromGenesisFile],
    ['GLOS', FC, getPaymentRequestsFromGlosFile],
    ['IMPS', IMPS, getPaymentRequestsFromImpsFile]
  ])('uses the %s payment request parser', (_, schemeId, parser) => {
    const scheme = { schemeId }

    const result = getPaymentRequestsFromFile(fileBuffer, scheme, filename)

    expect(result).toBe(paymentRequests)
    expect(readline.createInterface).toHaveBeenCalledWith(
      expect.objectContaining({
        readable: true
      })
    )
    expect(parser).toHaveBeenCalledWith(
      readBatchLines,
      scheme,
      expect.anything(),
      filename
    )
  })

  test('uses the SITI Agri parser for an unrecognised scheme', () => {
    const scheme = { schemeId: 'unknown-scheme' }

    const result = getPaymentRequestsFromFile(fileBuffer, scheme, filename)

    expect(result).toBe(paymentRequests)
    expect(getPaymentRequestsFromSitiAgriFile).toHaveBeenCalledWith(
      readBatchLines,
      scheme,
      expect.anything(),
      filename
    )
  })

  test('passes the same input stream to readline and the selected parser', () => {
    const scheme = { schemeId: ES }

    getPaymentRequestsFromFile(fileBuffer, scheme, filename)

    expect(getPaymentRequestsFromGenesisFile).toHaveBeenCalledWith(
      readBatchLines,
      scheme,
      expect.anything(),
      filename
    )
  })

  test('returns the parser result', () => {
    const scheme = { schemeId: FC }

    expect(
      getPaymentRequestsFromFile(fileBuffer, scheme, filename)
    ).toBe(paymentRequests)
  })
})
