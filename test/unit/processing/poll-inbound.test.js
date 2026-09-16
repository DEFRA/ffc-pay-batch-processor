jest.mock('ffc-pay-schemes', () => {
  const actual = jest.requireActual('ffc-pay-schemes')

  return {
    ...actual,
    getSchemeFromBatchFileName: jest.fn()
  }
})

jest.mock('../../../app/data', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  lock: {
    findByPk: jest.fn()
  }
}))

jest.mock('../../../app/storage', () => ({
  getInboundFileList: jest.fn()
}))

jest.mock('../../../app/processing/process-payment-file', () => jest.fn())

const mockDb = require('../../../app/data')
const mockStorage = require('../../../app/storage')
const { getSchemeFromBatchFileName, getSchemeIds } = require('ffc-pay-schemes')
const mockProcessPaymentFile = require('../../../app/processing/process-payment-file')
const pollInbound = require('../../../app/processing/poll-inbound')

const { SFI } = getSchemeIds()

const sfi = {
  name: 'SFI22',
  schemeId: SFI,
  sourceSystem: 'SFI'
}

describe('poll inbound', () => {
  let transaction
  let consoleLog

  beforeEach(() => {
    jest.clearAllMocks()

    transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }

    mockDb.sequelize.transaction.mockResolvedValue(transaction)
    mockDb.lock.findByPk.mockResolvedValue()
    mockStorage.getInboundFileList.mockResolvedValue(['file1', 'file2'])
    mockProcessPaymentFile.mockResolvedValue()
    getSchemeFromBatchFileName.mockReturnValue(sfi)

    consoleLog = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    consoleLog.mockRestore()
  })

  test('creates a database transaction', async () => {
    await pollInbound()

    expect(mockDb.sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('locks the lock table using the transaction', async () => {
    await pollInbound()

    expect(mockDb.lock.findByPk).toHaveBeenCalledWith(1, {
      transaction,
      lock: true
    })
  })

  test('gets the inbound file list', async () => {
    await pollInbound()

    expect(mockStorage.getInboundFileList).toHaveBeenCalledTimes(1)
  })

  test('gets the scheme for each inbound filename', async () => {
    await pollInbound()

    expect(getSchemeFromBatchFileName).toHaveBeenCalledTimes(2)
    expect(getSchemeFromBatchFileName).toHaveBeenNthCalledWith(1, 'file1')
    expect(getSchemeFromBatchFileName).toHaveBeenNthCalledWith(2, 'file2')
  })

  test('processes each file with a matching scheme', async () => {
    await pollInbound()

    expect(mockProcessPaymentFile).toHaveBeenCalledTimes(2)
    expect(mockProcessPaymentFile).toHaveBeenNthCalledWith(1, 'file1', sfi)
    expect(mockProcessPaymentFile).toHaveBeenNthCalledWith(2, 'file2', sfi)
  })

  test('does not process files without a matching scheme', async () => {
    getSchemeFromBatchFileName
      .mockReturnValueOnce(sfi)
      .mockReturnValueOnce(undefined)

    await pollInbound()

    expect(mockProcessPaymentFile).toHaveBeenCalledTimes(1)
    expect(mockProcessPaymentFile).toHaveBeenCalledWith('file1', sfi)
  })

  test('logs the identified scheme', async () => {
    await pollInbound()

    expect(consoleLog).toHaveBeenCalledWith(
      `Identified payment file as scheme: ${sfi.name}`
    )
  })

  test('commits the transaction after processing', async () => {
    await pollInbound()

    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('rolls back and rethrows when getting the inbound file list fails', async () => {
    const error = new Error('Test error')
    mockStorage.getInboundFileList.mockRejectedValue(error)

    await expect(pollInbound()).rejects.toThrow('Test error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back and rethrows when processing a payment file fails', async () => {
    const error = new Error('Processing error')
    mockProcessPaymentFile.mockRejectedValue(error)

    await expect(pollInbound()).rejects.toThrow('Processing error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back and rethrows when committing fails', async () => {
    const error = new Error('Commit error')
    transaction.commit.mockRejectedValue(error)

    await expect(pollInbound()).rejects.toThrow('Commit error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
  })
})
