const transformInvoiceLine = require('../../../../app/processing/genesis/transform-invoice-line')

describe('transform genesis invoice lines', () => {
  test('transforms invoice line when only one co-financing element', async () => {
    const lineData = ['D', '1096514', '32', '40121', '01372', '0197', '221', '', '10767.74', 'Payment for ESS P1 to P2 Transfer Other objective in North West', '', '', '', '', '', '', '', '', '']
    const result = transformInvoiceLine(lineData)
    expect(result).toEqual([{
      accountCode: '0197',
      companyCode: '32',
      costCentre: '40121',
      description: 'Payment for ESS P1 to P2 Transfer Other objective in North West',
      projectCode: undefined,
      standardCode: '01372',
      subAccountCode: '221',
      value: 10767.74
    }, {
      accountCode: '',
      companyCode: '',
      costCentre: '',
      description: '',
      projectCode: undefined,
      standardCode: '',
      subAccountCode: '',
      value: NaN
    }])
  })

  test('transforms invoice line when only both co-financing elements', async () => {
    const lineData = ['D', '1096514', '32', '40121', '01372', '0197', '221', '', '10767.74', 'Payment for ESS P1 to P2 Transfer Other objective in North West', '32', '40121', '01372', '0197', '221', '', '10767.74', 'Payment for ESS P1 to P2 Transfer Other objective in North West']
    const result = transformInvoiceLine(lineData)
    expect(result).toEqual([{
      accountCode: '0197',
      companyCode: '32',
      costCentre: '40121',
      description: 'Payment for ESS P1 to P2 Transfer Other objective in North West',
      projectCode: undefined,
      standardCode: '01372',
      subAccountCode: '221',
      value: 10767.74
    }, {
      accountCode: '0197',
      companyCode: '32',
      costCentre: '40121',
      description: 'Payment for ESS P1 to P2 Transfer Other objective in North West',
      projectCode: undefined,
      standardCode: '01372',
      subAccountCode: '221',
      value: 10767.74
    }])
  })
})
