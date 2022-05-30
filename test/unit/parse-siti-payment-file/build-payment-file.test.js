jest.mock('../../../app/parse-siti-payment-file/build-payment-requests')
const buildPaymentRequests = require('../../../app/parse-siti-payment-file/build-payment-requests')

jest.mock('../../../app/parse-siti-payment-file/validate')
const validate = require('../../../app/parse-siti-payment-file/validate')

const { buildAndTransformParseFile } = require('../../../app/parse-siti-payment-file/build-payment-file')

let fileBuffer
let sequence

let batchHeaders
let batchPaymentRequests

describe('SITI payment file batch header is split into batches, headers and lines', () => {
  beforeEach(async () => {
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')
    sequence = '0001'

    batchHeaders = [
      {
        batchValue: 200,
        exportDate: '2021-08-12',
        ledger: 'AP',
        numberOfPaymentRequests: 2,
        sequence: '0001',
        sourceSystem: 'SFIP'
      }
    ]
    batchPaymentRequests = [
      {
        contractNumber: 'SFIP000001',
        currency: 'GBP',
        deliveryBody: 'RP00',
        frn: '1000000001',
        invoiceLines:
            [{
              accountCode: 'SOS27',
              agreementNumber: 'SIP00000000001',
              batchToCustomerDate: '2022-12-01',
              convergence: 'N',
              deliveryBody: 'RP00',
              description: 'G00 - Gross value of claim',
              dueDate: '2022-12-01',
              fundCode: 'DRD10',
              invoiceNumber: 'SFI00000001',
              lineId: '1',
              marketingYear: '2022',
              schemeCode: '80001',
              value: 100
            }],
        invoiceNumber: 'SFI00000001',
        paymentRequestNumber: 1,
        paymentType: '1',
        preferenceCurrency: 'GBP',
        schedule: 'M12',
        sourceSystem: 'SFIP',
        value: 100
      },
      {
        contractNumber: 'SFIP000002',
        currency: 'GBP',
        deliveryBody: 'RP00',
        frn: '1000000002',
        invoiceLines:
            [{
              accountCode: 'SOS273',
              agreementNumber: 'SIP00000000002',
              batchToCustomerDate: '2022-12-01',
              convergence: 'N',
              deliveryBody: 'RP00',
              description: 'G00 - Gross value of claim',
              dueDate: '2022-12-01',
              fundCode: 'DRD10',
              invoiceNumber: 'SFI00000002',
              lineId: '1',
              marketingYear: '2022',
              schemeCode: '80001',
              value: 100
            }],
        invoiceNumber: 'SFI00000002',
        paymentRequestNumber: 3,
        paymentType: '2',
        preferenceCurrency: 'GBP',
        schedule: 'M12',
        sourceSystem: 'SFIP',
        value: 100
      }]

    validate.mockReturnValue(true)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call validate when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, sequence)
    expect(validate).toHaveBeenCalled()
  })

  test('should call validate with batchHeaders, batchPaymentRequests and sequence when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, sequence)
    expect(validate).toHaveBeenCalledWith(batchHeaders, batchPaymentRequests, sequence)
  })

  test('should call buildPaymentRequests when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, sequence)
    expect(buildPaymentRequests).toHaveBeenCalled()
  })

  test('should call buildPaymentRequests with batchPaymentRequests when validate return true', async () => {
    await buildAndTransformParseFile(fileBuffer, sequence)
    expect(buildPaymentRequests).toHaveBeenCalledWith(batchPaymentRequests)
  })

  test('should reject when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrow()
  })

  test('should reject with Error when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrowError(Error)
  })

  test('should reject with "Invalid file" error when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrowError('Invalid file')
  })

  test('should reject when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrow()
  })

  test('should reject with Error when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrowError(Error)
  })

  test('should reject with "Invalid file" error when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, sequence)
    }

    await expect(wrapper).rejects.toThrowError('Invalid file')
  })

  test('should not call buildPaymentRequests when validate returns false', async () => {
    validate.mockReturnValue(false)

    try {
      await buildAndTransformParseFile(fileBuffer, sequence)
    } catch (err) { }

    expect(buildPaymentRequests).not.toHaveBeenCalled()
  })
})
