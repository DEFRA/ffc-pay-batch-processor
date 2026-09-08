const { randomUUID } = require('node:crypto')
const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const { buildInvoiceLines } = require('./build-invoice-lines')
const handleKnownDefects = require('./handle-known-defects')

const { CS, COHT_REVENUE } = getSchemeIds()
const { SFI_EXPANDED: SFI_EXPANDED_SOURCE_SYSTEM, COHT_REVENUE: COHT_REVENUE_SOURCE_SYSTEM } = getSourceSystems()
const START_AT_ZERO = 0

const getCombinedSourceSystem = (schemeId) => {
  if (schemeId === COHT_REVENUE) {
    return COHT_REVENUE_SOURCE_SYSTEM
  }
  return SFI_EXPANDED_SOURCE_SYSTEM
}

const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) {
    return []
  }

  return paymentRequests.map(paymentRequest => ({
    sourceSystem: (sourceSystem === SFI_EXPANDED_SOURCE_SYSTEM) ? getCombinedSourceSystem(paymentRequest.schemeId) : sourceSystem,
    schemeId: paymentRequest.schemeId,
    batch: paymentRequest.batch,
    deliveryBody: paymentRequest.schemeId === CS ? paymentRequest.invoiceLines?.[START_AT_ZERO]?.deliveryBody : paymentRequest.deliveryBody,
    invoiceNumber: paymentRequest.invoiceNumber,
    frn: paymentRequest.frn,
    marketingYear: paymentRequest.invoiceLines?.[START_AT_ZERO]?.marketingYear,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    agreementNumber: paymentRequest.invoiceLines?.[START_AT_ZERO]?.agreementNumber,
    contractNumber: paymentRequest.contractNumber,
    paymentType: paymentRequest.paymentType,
    currency: paymentRequest.currency,
    schedule: paymentRequest.schedule,
    dueDate: paymentRequest.invoiceLines?.[START_AT_ZERO]?.dueDate,
    value: paymentRequest.value,
    correlationId: randomUUID(),
    invoiceLines: buildInvoiceLines(paymentRequest)
  })).map(x => handleKnownDefects(x))
}

module.exports = buildPaymentRequests
