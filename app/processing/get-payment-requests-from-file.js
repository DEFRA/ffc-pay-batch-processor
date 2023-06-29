const readline = require('readline')
const { Readable } = require('stream')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')
const { getPaymentRequestsFromGenesisFile } = require('./genesis/get-payment-requests')
const { getPaymentRequestsFromImpsFile } = require('./imps/get-payment-requests')
const { es, imps } = require('../constants/schemes')

const getPaymentRequestsFromFile = (fileBuffer, scheme, filename) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  if (scheme.schemeId === es.schemeId) {
    return getPaymentRequestsFromGenesisFile(readBatchLines, scheme, input, filename)
  }
  if (scheme.schemeId === imps.schemeId) {
    return getPaymentRequestsFromImpsFile(readBatchLines, scheme, input, filename)
  }
  return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input, filename)
}

module.exports = getPaymentRequestsFromFile
