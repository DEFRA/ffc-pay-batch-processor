function createMessage (body, type, correlationId) {
  return {
    body,
    type,
    source: 'ffc-sfi-payment-batch-processor',
    correlationId
  }
}

module.exports = createMessage
