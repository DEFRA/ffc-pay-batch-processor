const readline = require('readline')
const { Readable } = require('stream')
const { es, imps, fc } = require('../constants/schemes')
const { getPaymentRequestsFromGenesisFile } = require('./genesis/get-payment-requests')
const getPaymentRequestsFromGlosFile = require('./glos/get-payment-requests')
const { getPaymentRequestsFromImpsFile } = require('./imps/get-payment-requests')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')

const getPaymentRequestsFromFile = (fileBuffer, scheme, filename) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)

  switch (scheme.schemeId) {
    case es.schemeId:
      return getPaymentRequestsFromGenesisFile(readBatchLines, scheme, input, filename)
    case fc.schemeId:
      return getPaymentRequestsFromGlosFile(readBatchLines, scheme, input, filename)
    case imps.schemeId:
      return getPaymentRequestsFromImpsFile(readBatchLines, scheme, input, filename)
    default:
      return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input, filename)
  }
}

module.exports = getPaymentRequestsFromFile
