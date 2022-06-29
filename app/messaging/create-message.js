function createMessage (body, type) {
  return {
    body,
    type,
    source: 'ffc-pay-batch-processor'
  }
}

module.exports = createMessage
