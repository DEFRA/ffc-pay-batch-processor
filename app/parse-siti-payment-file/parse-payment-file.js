const readline = require('readline')
const { Readable } = require('stream')
const { v4: uuidv4 } = require('uuid')
const { sendBatchProcessingEvent, sendBatchCaptureEvent, sendBatchErrorEvent } = require('../event')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformInvoiceLines = require('./transform-invoice-lines')
const buildPaymentRequests = require('./payment-request')
const validate = require('./validate')

const { sendPaymentBatchMessage } = require('../messaging')

const parseBatchLineType = (batchLine, batch) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'H':
      batch.paymentRequests.push(transformHeaders(batchLine))
      return true
    case 'L':
      batch.paymentRequests[batch.paymentRequests.length - 1]
        .invoiceLines
        .push(transformInvoiceLines(batchLine))
      return true
    default:
      return false
  }
}

const createBatch = (sequence) => {
  return {
    sequence,
    batchHeaders: [],
    paymentRequests: []
  }
}

const buildAndTransformParseFile = (fileBuffer, sequence) => {
  const batch = createBatch(sequence)
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !parseBatchLineType(batchLine, batch) ??
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      validate(batch.batchHeaders, batch.paymentRequests, batch.sequence)
        ? resolve(buildPaymentRequests(batch.paymentRequests))
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const correlationIdEnrichment = async (filename, paymentRequests) => {
  const correlation = { filename, correlationIds: [] }

  for (const paymentRequest of paymentRequests) {
    const correlationId = uuidv4()
    const agreementNumber = paymentRequest.agreementNumber
    const invoiceNumber = paymentRequest.invoiceNumber
    const contractNumber = paymentRequest.contractNumber
    paymentRequest.correlationId = correlationId
    await sendBatchProcessingEvent(paymentRequest)
    correlation.correlationIds.push({ correlationId, agreementNumber, invoiceNumber, contractNumber })
  }

  return correlation
}

const parsePaymentFile = async (filename, fileBuffer, sequence) => {
  try {
    const paymentRequests = await buildAndTransformParseFile(fileBuffer, sequence)
    const correlation = await correlationIdEnrichment(filename, paymentRequests)
    await sendBatchCaptureEvent(correlation)
    await sendPaymentBatchMessage(paymentRequests)
    return true
  } catch (err) {
    await sendBatchErrorEvent(filename, 'Error parsing payment file', err.message)
    console.log(err)
  }

  return false
}

module.exports = parsePaymentFile
