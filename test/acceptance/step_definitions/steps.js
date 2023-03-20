const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber')
const __ = require('hamjest')
const processor = require('../support/processor')
setDefaultTimeout(60 * 1000)

Given('a batch file is received', async function () {
  await processor.uploadFile()
})

When('the file is processed', async function () {
})

Then('a Business Transaction object is generated', async function () {
  const messages = await processor.consumeMessage()

  const expectedFields = {
    paymentRequestNumber: __.equalTo(1),
    sourceSystem: __.string(),
    invoiceNumber: __.string(),
    deliveryBody: __.string(),
    marketingYear: __.number(),
    invoiceLines: __.array(),
  }

  messages.forEach(x => {
    __.assertThat(x, __.hasProperties(expectedFields))
  })
})
