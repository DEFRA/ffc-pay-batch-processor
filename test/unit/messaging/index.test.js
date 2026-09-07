const mockSendBatchMessages = jest.fn()

jest.mock('../../../app/messaging/send-batch-messages', () => mockSendBatchMessages)

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { sendPaymentBatchMessages } = require('../../../app/messaging')

let paymentRequests

describe('sendPaymentBatchMessages', () => {
  beforeEach(() => {
    messageConfig.paymentBatchTopic = 'payment-batch'

    jest.spyOn(console, 'info').mockImplementation(() => {})

    paymentRequests = structuredClone(require('../../mocks/payment-request').paymentRequests)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call sendBatchMessages with payment requests, type and topic', async () => {
    await sendPaymentBatchMessages(paymentRequests)
    expect(mockSendBatchMessages).toHaveBeenCalledWith(
      paymentRequests,
      'uk.gov.defra.ffc.pay.request',
      messageConfig.paymentBatchTopic
    )
  })

  test('should log identifiers of published payment requests', async () => {
    await sendPaymentBatchMessages(paymentRequests)
    expect(console.info).toHaveBeenCalledWith(
      'Publishing valid payment requests',
      paymentRequests.map(({ frn, sbi, paymentRequestNumber }) => ({ frn, sbi, paymentRequestNumber }))
    )
  })
})
