const { GBP } = require('../../app/constants/currency')
const { Q4 } = require('../../app/constants/schedule')
const { sfiPilot } = require('../../app/constants/schemes')
const { invoiceLines, mappedInvoiceLines } = require('./invoice-lines')
const correlationId = require('./correlation-id')

const paymentRequest = {
  sourceSystem: sfiPilot.sourceSystem,
  schemeId: sfiPilot.schemeId,
  batch: 'SITISFI0001_AP_20230306115413497.dat',
  frn: 1234567890,
  paymentRequestNumber: 1,
  invoiceNumber: 'SITI1234567',
  contractNumber: 'S1234567',
  currency: GBP,
  schedule: Q4,
  value: 100,
  deliveryBody: 'RP00',
  invoiceLines
}

const paymentRequests = [paymentRequest]

const mappedPaymentRequest = {
  ...paymentRequest,
  invoiceLines: mappedInvoiceLines,
  marketingYear: invoiceLines[0].marketingYear,
  agreementNumber: invoiceLines[0].agreementNumber,
  dueDate: invoiceLines[0].dueDate,
  correlationId
}

const unsuccessfulMappedPaymentRequest = {
  ...mappedPaymentRequest,
  errorMessage: 'Payment request for FRN: 1234567890 - SITI1234567 from batch SITISFI0001_AP_20230306115413497.dat is invalid, Example error'
}

const mappedPaymentRequests = [mappedPaymentRequest]

module.exports = {
  paymentRequest,
  paymentRequests,
  mappedPaymentRequest,
  unsuccessfulMappedPaymentRequest,
  mappedPaymentRequests
}
