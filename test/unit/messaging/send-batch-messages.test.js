const mockSendMessages = jest.fn()

jest.mock('../../../app/messaging/send-message', () => mockSendMessages)

const sendBatchMessages = require('../../../app/messaging/send-batch-messages')

let paymentRequest
let paymentRequests

describe('sendBatchMessages', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})

    paymentRequest = structuredClone(require('../../mocks/payment-request').paymentRequest)
    paymentRequests = structuredClone(require('../../mocks/payment-request').paymentRequests)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call sendMessages when body contains valid objects', async () => {
    await sendBatchMessages(paymentRequests, 'uk.gov.defra.ffc.pay.request', {})
    expect(mockSendMessages).toHaveBeenCalledTimes(1)
  })

  test('should not call sendMessages when body is an empty array', async () => {
    await sendBatchMessages([], 'uk.gov.defra.ffc.pay.request', {})
    expect(mockSendMessages).not.toHaveBeenCalled()
  })

  test('should not call sendMessages when body is undefined', async () => {
    await sendBatchMessages(undefined, 'uk.gov.defra.ffc.pay.request', {})
    expect(mockSendMessages).not.toHaveBeenCalled()
  })

  test('should not log error when all items are valid objects', async () => {
    await sendBatchMessages(paymentRequests, 'uk.gov.defra.ffc.pay.request', {})
    expect(console.error).not.toHaveBeenCalled()
  })

  test('should log error with identifiers when item is not a valid object', async () => {
    await sendBatchMessages(['invalid'], 'uk.gov.defra.ffc.pay.request', {})
    expect(console.error).toHaveBeenCalledWith(
      'Could not create message for item:',
      { frn: undefined, sbi: undefined, paymentRequestNumber: undefined }
    )
  })

  test('should still call sendMessages even when some items are invalid', async () => {
    await sendBatchMessages(['invalid', paymentRequest], 'uk.gov.defra.ffc.pay.request', {})
    expect(mockSendMessages).toHaveBeenCalledTimes(1)
  })

  test('should log identifiers from item when item is an object failing validation', async () => {
    const badItem = { frn: 1234567890, sbi: 123456789, paymentRequestNumber: 2 }
    jest.spyOn(require('joi'), 'object').mockReturnValueOnce({
      required: () => ({ validate: () => ({ error: new Error('invalid') }) })
    })
    await sendBatchMessages([badItem], 'uk.gov.defra.ffc.pay.request', {})
    expect(console.error).toHaveBeenCalledWith(
      'Could not create message for item:',
      { frn: 1234567890, sbi: 123456789, paymentRequestNumber: 2 }
    )
  })
})
