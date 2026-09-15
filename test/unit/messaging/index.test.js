const mockSendBatchMessages = jest.fn()

jest.mock('../../../app/messaging/send-batch-messages', () => mockSendBatchMessages)

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { sendPaymentBatchMessages } = require('../../../app/messaging')

let paymentRequests

describe('sendPaymentBatchMessages', () => {
  beforeEach(() => {
    messageConfig.paymentBatchTopic = 'payment-batch'

    jest.spyOn(console, 'info').mockImplementation(() => { })

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

  test('should include sbi in logged identifiers when sbi is present', async () => {
    paymentRequests[0].sbi = '123456789'

    await sendPaymentBatchMessages(paymentRequests)

    expect(console.info).toHaveBeenCalledWith(
      'Publishing valid payment requests',
      paymentRequests.map(({ frn, sbi, paymentRequestNumber }) => ({
        frn,
        sbi,
        paymentRequestNumber
      }))
    )
  })

  test('should omit sbi from logged identifiers when sbi is undefined', async () => {
    paymentRequests[0].sbi = undefined

    await sendPaymentBatchMessages(paymentRequests)

    const loggedRequests = console.info.mock.calls[0][1]

    expect(loggedRequests[0]).not.toHaveProperty('sbi')
  })
})
