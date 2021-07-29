const fs = require('fs')
const path = require('path')

const delimiter = '^'
const fileName = path.join(__dirname, 'SITIELM0001_AP_20210729111500.dat')

const filterData = (lineType, invoiceLines) => {
  return invoiceLines.filter(header => header[0] === lineType)
}

const transformBatch= (invoiceLines) => {
  const batch = filterData('B', invoiceLines)

  return batch.map(header => { 
    const batchData = header.split(delimiter)
    const batchValue = parseFloat(batchData[3])
    const invoices = parseInvoiceData(invoiceLines)
    const numberOfInvoices = parseFloat(batchData[2])

    return {
      exportDate: batchData[1],
      numberOfInvoices,
      batchValue,
      batchId: batchData[4],
      creatorId: batchData[5],
      invoiceType: batchData[6],
      invoices,
      validation: {
        numberOfInvoicesValid: numberOfInvoices === invoices.length,
        invoiceTotalsValid: batchValue === checkInvoiceTotal(invoices, 'totalValue'),
        invoiceLinesTotalsValid: invoices.filter(a => a.lineTotalsValid).length === 0 ? true : false
      }
    }
  })
}

const transformHeaders = (invoiceLines) => {
  const headers = filterData('H', invoiceLines)

  return headers.map(header => { 
    const headerData = header.split(delimiter)
    return {
      invoiceNumber: headerData[1],
      requestInvoiceNumber: headerData[2],
      claimId: headerData[3],
      paymentType: headerData[4],
      frn: headerData[5],
      currency: headerData[6],
      totalValue: parseFloat(headerData[7]),
      deliveryBodyCode: headerData[8],
      preferenceCurrency: headerData[9],
      creatorId: headerData[10],
      monthlyPaymentSchedule: headerData[11],
      lines: []
    }
  })
}

const transformLines = (invoiceLines) => {
  const lines = filterData('L', invoiceLines)

  return lines.map(line => { 
    const lineData = line.split(delimiter)
    return {
      invoiceNumber: lineData[1],
      value: parseFloat(lineData[2]),
      marketingYear: lineData[3],
      schemeCode: lineData[4],
      fund: lineData[5],
      agreementNumber: lineData[6],
      deliveryBody: lineData[7],
      convergence: lineData[8],
      lineId: lineData[9],
      lineDescription: lineData[10],
      dueDate: lineData[11],
      batchToCustomerDate: lineData[12],
      msdaxAccountCode: lineData[13]
    }
  })
}

const checkInvoiceTotal = (data, key) => {
 return data.reduce((a, b) => { return a + b[key] }, 0 )
}

const parseInvoiceData = (invoiceData) => {

  const invoiceHeaders = transformHeaders(invoiceData)
  const invoiceLines = transformLines(invoiceData)

  return invoiceHeaders.map(header => {
      header.lines = invoiceLines.filter(a => a.invoiceNumber === header.invoiceNumber)
      header.lineTotalsValid = header.totalValue === checkInvoiceTotal(header.lines, 'value') 
      return header
    })
}

const formatData = (data) => {
  const invoice = data.toString();
  return invoice.split(/\n\r/)
}


const parseFile = () => {
  const batches = []
  return new Promise((resolve, reject) => {
    fs.createReadStream(fileName)
      .on('data', data => {   
        const invoiceData = formatData(data)
        const batch = transformBatch(invoiceData).flat()
        batches.push(batch)
      })
      .on('error', (err) => {
        batches.push({ error: err.message })
        resolve(batches.flat())
      })
      .on('end', () => {
        resolve(batches.flat())
      })
    })
}

module.exports = parseFile

