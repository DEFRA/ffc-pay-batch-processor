const filenameMasks = require('./filename-masks')

const mapData = (data, maskData) => {
  Object.keys(maskData).forEach((key, i) => { maskData[key] = data[i] })
  return maskData
}

const parseFilename = (filename) => {
  for (const key of Object.keys(filenameMasks)) {
    console.log(`Trying to match file to ${filenameMasks[key].scheme}`)
    filename = filename.replace(/_/g, '')
    let i = 0
    const convertToMask = filenameMasks[key].mask.replace(/#/g, () => filename[i++])
    const mappedData = mapData(convertToMask.split(' '), filenameMasks[key].data)
    if (mappedData.source === filenameMasks[key].schemeType) {
      return { scheme: filenameMasks[key].scheme, ...mappedData }
    }
    console.log(`No match for ${filenameMasks[key].scheme}`)
  }
}

module.exports = parseFilename
