const { filename1 } = require('../mocks/glos-filenames')
const { fc } = require('../../app/constants/schemes')
const { invoiceLines, mappedInvoiceLines } = require('./invoice-lines')
const correlationId = require('./correlation-id')

const paymentRequest = {
  correlationId,
  sourceSystem: fc.sourceSystem,
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
  errorMessage: 'Payment request for FRN: 1102294241 - 33315 16 is invalid, Example error'
}

const mappedPaymentRequests = [mappedPaymentRequest]

module.exports = {
  paymentRequest,
  paymentRequests,
  mappedPaymentRequest,
  unsuccessfulMappedPaymentRequest,
  mappedPaymentRequests
}
