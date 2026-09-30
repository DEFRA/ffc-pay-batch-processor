const { getSchemeIds, getSourceSystems } = require('ffc-pay-schemes')
const { filename1 } = require('../mocks/glos-filenames')
const { invoiceLines, mappedInvoiceLines } = require('./invoice-lines')
const correlationId = require('./correlation-id')

const { FC } = getSchemeIds()
const { FC: FC_SOURCE_SYSTEM } = getSourceSystems()

const paymentRequest = {
  correlationId,
  schemeId: FC,
  sourceSystem: FC_SOURCE_SYSTEM,
  batch: filename1,
  invoiceNumber: '33315 16',
  paymentRequestNumber: 1,
  frn: '1102294241',
  sbi: '106609512',
  claimDate: '31/05/2023 22:01:38',
  invoiceLines
}

const paymentRequests = [paymentRequest]

const mappedPaymentRequest = {
  ...paymentRequest,
  invoiceLines: mappedInvoiceLines
}

const unsuccessfulMappedPaymentRequest = {
  ...mappedPaymentRequest,
  errorMessage: 'Payment request for FRN: 1102294241 - 33315 16 from batch FCAP_0001_230607220141.dat is invalid, Example error'
}

const mappedPaymentRequests = [mappedPaymentRequest]

module.exports = {
  paymentRequest,
  paymentRequests,
  mappedPaymentRequest,
  unsuccessfulMappedPaymentRequest,
  mappedPaymentRequests
}
