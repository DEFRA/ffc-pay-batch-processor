const parseFile = require('./index')
const { getInboundFileList, downloadPaymentFile } = require('../blob-storage')
async function testGetData () {
  console.time('parse')
  const files = await getInboundFileList()
  const filebuffer = await downloadPaymentFile(files[0])
  await parseFile(filebuffer)
  console.timeEnd('parse')
}
testGetData()
