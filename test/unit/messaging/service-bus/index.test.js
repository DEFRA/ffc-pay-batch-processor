const {
  createServiceBusClient,
  createReceiver,
  subscribeReceiver
} = require('../../../../app/messaging/service-bus')

describe('service-bus index', () => {
  test('exports createServiceBusClient', () => {
    expect(createServiceBusClient).toBe(require('../../../../app/messaging/service-bus/create-service-bus-client').createServiceBusClient)
  })

  test('exports createReceiver', () => {
    expect(createReceiver).toBe(require('../../../../app/messaging/service-bus/create-receiver').createReceiver)
  })

  test('exports subscribeReceiver', () => {
    expect(subscribeReceiver).toBe(require('../../../../app/messaging/service-bus/subscribe-receiver').subscribeReceiver)
  })
})
