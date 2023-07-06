const getTotalLinesFromGlosFile = async (readGlosPaymentFile) => {
  return new Promise((resolve, reject) => {
    let paymentFileTotalLines = 0

    readGlosPaymentFile.on('line', (line) => {
      paymentFileTotalLines++
    })
    readGlosPaymentFile.on('close', () => {
      resolve(paymentFileTotalLines)
      reject(new Error('failed to read Glos payment file'))
      readGlosPaymentFile.close()
      console.log('total payment lines =', paymentFileTotalLines)
    })
  })
}

module.exports = {
  getTotalLinesFromGlosFile
}
