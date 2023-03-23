const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber')
const __ = require('hamjest')
const processor = require('../support/processor')

setDefaultTimeout(60 * 1000)

Given('a batch file is received', async () => {
  await processor.uploadFile()
})

When('the file is processed', async () => {
})

Then('a Payment Request is generated', async () => {
  const messages = await processor.consumeMessages()

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
