const mapData = (data, maskData) => {
  let i = 0
  Object.keys(maskData).forEach((key) => {
    maskData[key] = data[i++]
  })
  return maskData
}

const parseFilename = (filename, filenameMask) => {
  filename = filename.replace(/_/g, '')
  let i = 0
  const convertToMask = filenameMask.mask.replace(/#/g, () => {
    return filename[i++]
  })
  return mapData(convertToMask.split(' '), filenameMask.data)
}

module.exports = parseFilename
