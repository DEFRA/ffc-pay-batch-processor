jest.mock('../../../app/data')
const mockDb = require('../../../app/data')

jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')

jest.mock('../../../app/processing/get-scheme-from-filename')
const mockGetSchemeFromFilename = require('../../../app/processing/get-scheme-from-filename')

jest.mock('../../../app/processing/process-payment-file')
const mockProcessPaymentFile = require('../../../app/processing/process-payment-file')

jest.mock('../../../app/processing/glos/find-glos-control-file')
const { findGlosControlFile: mockFindGlosControlFile } = require('../../../app/processing/glos/find-glos-control-file')

const mockCommit = jest.fn()
const mockRollback = jest.fn()

const { sfi, fc } = require('../../../app/constants/schemes')

const pollInbound = require('../../../app/processing/poll-inbound')

describe('poll inbound', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.sequelize = {
      transaction: jest.fn(() => Promise.resolve({ commit: mockCommit, rollback: mockRollback }))
    }
    mockStorage.getInboundFileList = jest.fn(() => Promise.resolve(['file1', 'file2']))
    mockGetSchemeFromFilename.mockReturnValue(sfi)
  })

  test('should create a database transaction', async () => {
    await pollInbound()
    expect(mockDb.sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('should lock the lock table', async () => {
    await pollInbound()
    expect(mockDb.lock.findByPk).toHaveBeenCalledTimes(1)
    expect(mockDb.lock.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({ lock: true }))
  })

  test('should get the inbound file list', async () => {
    await pollInbound()
    expect(mockStorage.getInboundFileList).toHaveBeenCalledTimes(1)
  })

  test('should get the scheme from each filename', async () => {
    await pollInbound()
    expect(mockGetSchemeFromFilename).toHaveBeenCalledTimes(2)
    expect(mockGetSchemeFromFilename).toHaveBeenCalledWith('file1')
    expect(mockGetSchemeFromFilename).toHaveBeenCalledWith('file2')
  })

  test('should process each payment file if scheme matched', async () => {
    await pollInbound()
    expect(mockProcessPaymentFile).toHaveBeenCalledTimes(2)
    expect(mockProcessPaymentFile).toHaveBeenCalledWith('file1', sfi)
    expect(mockProcessPaymentFile).toHaveBeenCalledWith('file2', sfi)
  })

  test('should not process payment file if scheme not matched', async () => {
    mockGetSchemeFromFilename.mockReturnValue(undefined)
    await pollInbound()
    expect(mockProcessPaymentFile).toHaveBeenCalledTimes(0)
  })

  test('should commit the transaction', async () => {
    await pollInbound()
    expect(mockCommit).toHaveBeenCalledTimes(1)
  })

  test('should rollback the transaction if error', async () => {
    mockStorage.getInboundFileList.mockRejectedValue(new Error('Test error'))
    await expect(pollInbound()).rejects.toThrow('Test error')
    expect(mockRollback).toHaveBeenCalledTimes(1)
  })

  test('should call findGlosControlFile if scheme is fc', async () => {
    mockGetSchemeFromFilename.mockReturnValueOnce(fc)
    await pollInbound()
    expect(mockFindGlosControlFile).toHaveBeenCalledTimes(1)
  })
})
