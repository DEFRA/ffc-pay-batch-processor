const sendMessages = require('../../../app/messaging/send-message')
const { getSender, clearCache } = require('../../../app/messaging/service-bus/sender-cache')
const { sendBatchMessages } = require('../../../app/messaging/service-bus/send-batch-messages')

jest.mock('../../../app/messaging/service-bus/sender-cache')
jest.mock('../../../app/messaging/service-bus/send-batch-messages')

describe('sendMessages', () => {
  const config = { address: 'topic-a', host: 'test.servicebus.windows.net' }
  const mockSender = { sendMessages: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
    getSender.mockReturnValue(mockSender)
    sendBatchMessages.mockResolvedValue()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  test('gets sender from cache and sends messages', async () => {
    const messages = [{ body: { id: 1 }, type: 'type-1', source: 'source' }]

    await sendMessages(messages, config)

    expect(getSender).toHaveBeenCalledWith(config)
    expect(sendBatchMessages).toHaveBeenCalledWith(mockSender, messages)
  })

  test('logs error when sending messages fails', async () => {
    const messages = [{ body: { id: 1 }, type: 'type-1', source: 'source' }]
    const error = new Error('send failed')
    sendBatchMessages.mockRejectedValue(error)

    await sendMessages(messages, config)

    expect(console.error).toHaveBeenCalledWith('Could not send messages for', messages, error)
  })

  test('logs error when getting sender fails', async () => {
    const messages = [{ body: { id: 1 }, type: 'type-1', source: 'source' }]
    const error = new Error('cache closed')
    getSender.mockImplementation(() => { throw error })

    await sendMessages(messages, config)

    expect(sendBatchMessages).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('Could not send messages for', messages, error)
  })
})
