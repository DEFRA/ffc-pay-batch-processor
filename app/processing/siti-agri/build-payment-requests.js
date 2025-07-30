const { v4: uuidv4 } = require('uuid')
const { buildInvoiceLines } = require('./build-invoice-lines')
const handleKnownDefects = require('./handle-known-defects')
const { cs, combinedOffer } = require('../../constants/schemes')
const { sfiExpanded, csHigherTier } = require('../../constants/combined-offer-schemes')

const getCombinedSourceSystem = (schemeId) => {
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
    deliveryBody: paymentRequest.schemeId === cs.schemeId ? paymentRequest.invoiceLines?.[0]?.deliveryBody : paymentRequest.deliveryBody,
    invoiceNumber: paymentRequest.invoiceNumber,
    frn: paymentRequest.frn,
    marketingYear: paymentRequest.invoiceLines?.[0]?.marketingYear,
    paymentRequestNumber: paymentRequest.paymentRequestNumber,
    agreementNumber: paymentRequest.invoiceLines?.[0]?.agreementNumber,
    contractNumber: paymentRequest.contractNumber,
    paymentType: paymentRequest.paymentType,
    currency: paymentRequest.currency,
    schedule: paymentRequest.schedule,
    dueDate: paymentRequest.invoiceLines?.[0]?.dueDate,
    value: paymentRequest.value,
    correlationId: uuidv4(),
    invoiceLines: buildInvoiceLines(paymentRequest)
  })).map(x => handleKnownDefects(x))
}

module.exports = buildPaymentRequests
