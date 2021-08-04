const mapData = (data, maskData) => {
  Object.keys(maskData).forEach((key, i) => { maskData[key] = data[i] })
  return maskData
}

const parseFilename = (filename, filenameMask) => {
  filename = filename.replace(/_/g, '')
  let i = 0
  const convertToMask = filenameMask.mask.replace(/#/g, () => filename[i++])
  return mapData(convertToMask.split(' '), filenameMask.data)
}

module.exports = parseFilename
