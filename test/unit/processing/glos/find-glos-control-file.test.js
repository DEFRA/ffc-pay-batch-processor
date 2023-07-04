jest.mock('../../../../app/retry')
const { retry: mockRetry } = require('../../../../app/retry')

const { findGlosControlFile } = require('../../../../app/processing/glos/find-glos-control-file')

const glosPaymentFile = 'glosFileName.dat'

describe('validate glos control file', () => {
  test('should call retry', async () => {
    await findGlosControlFile(glosPaymentFile)
    expect(mockRetry).toBeCalled()
  })
})
