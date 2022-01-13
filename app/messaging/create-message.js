function createMessage (body, type, correlationId) {
  return {
    body,
    type,
    source: 'ffc-pay-batch-processor',
    correlationId
  }
}

module.exports = createMessage
