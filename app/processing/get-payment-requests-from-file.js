const { getSchemeIds } = require('ffc-pay-schemes')
const readline = require('node:readline')
const { Readable } = require('node:stream')
const { getPaymentRequestsFromGenesisFile } = require('./genesis/get-payment-requests')
const getPaymentRequestsFromGlosFile = require('./glos/get-payment-requests')
const { getPaymentRequestsFromImpsFile } = require('./imps/get-payment-requests')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')

const { ES, FC, IMPS } = getSchemeIds()

const getPaymentRequestsFromFile = (fileBuffer, scheme, filename) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)

  switch (scheme.schemeId) {
    case ES:
      return getPaymentRequestsFromGenesisFile(readBatchLines, scheme, input, filename)
    case FC:
      return getPaymentRequestsFromGlosFile(readBatchLines, scheme, input, filename)
    case IMPS:
      return getPaymentRequestsFromImpsFile(readBatchLines, scheme, input, filename)
    default:
      return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input, filename)
  }
}

module.exports = getPaymentRequestsFromFile
