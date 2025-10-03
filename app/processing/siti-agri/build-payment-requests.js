const { v4: uuidv4 } = require('uuid')
const { buildInvoiceLines } = require('./build-invoice-lines')
const handleKnownDefects = require('./handle-known-defects')
const { cs, combinedOffer, cohtCapital } = require('../../constants/schemes')
const { sfiExpanded, csHigherTier } = require('../../constants/combined-offer-schemes')
const START_AT_ZERO = 0

const getCombinedSourceSystem = (schemeId) => {
  if (schemeId === cohtCapital.schemeId) {
    return cohtCapital.sourceSystem
  }
  if (schemeId === csHigherTier.schemeId) {
    return csHigherTier.sourceSystem
  }
  return sfiExpanded.sourceSystem
}

const buildPaymentRequests = (paymentRequests, sourceSystem) => {
  if (paymentRequests === undefined) { return [] }

  return paymentRequests.map(paymentRequest => ({
    sourceSystem: (sourceSystem !== combinedOffer.sourceSystem) ? sourceSystem : getCombinedSourceSystem(paymentRequest.schemeId),
    schemeId: paymentRequest.schemeId,
    batch: paymentRequest.batch,
    deliveryBody: paymentRequest.schemeId === cs.schemeId ? paymentRequest.invoiceLines?.[START_AT_ZERO]?.deliveryBody : paymentRequest.deliveryBody,
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
    correlationId: uuidv4(),
    invoiceLines: buildInvoiceLines(paymentRequest)
  })).map(x => handleKnownDefects(x))
}

module.exports = buildPaymentRequests
