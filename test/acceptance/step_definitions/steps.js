const { Given, When, Then, Before, setDefaultTimeout } = require('@cucumber/cucumber')
const __ = require('hamjest')
const processor = require('../support/processor')

setDefaultTimeout(60 * 1000)

Before({ name: 'Clear topic to ensure clean test run' }, async function () {
  await processor.consumeMessages('Clearing messages')
})

Given('a batch file is received', async () => {
  await processor.uploadFile()
})

When('the file is processed', async () => {
})

Then('a Payment Request is generated', async () => {
  const messages = await processor.consumeMessages('Receiving messages')

  const expectedFields = {
    paymentRequestNumber: __.equalTo(1),
    sourceSystem: __.string(),
    invoiceNumber: __.string(),
    deliveryBody: __.string(),
    marketingYear: __.number(),
    invoiceLines: __.array()
  }

  __.assertThat(messages.length, __.greaterThan(0))

  messages.forEach(x => {
    __.assertThat(x, __.hasProperties(expectedFields))
  })
})
