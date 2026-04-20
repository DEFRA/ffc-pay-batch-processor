describe('Application Insights', () => {
  const DEFAULT_ENV = process.env
  let useAzureMonitor

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/monitor-opentelemetry', () => ({
      useAzureMonitor: jest.fn(),
    }))

    useAzureMonitor = require('@azure/monitor-opentelemetry').useAzureMonitor

    process.env = { ...DEFAULT_ENV }

    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('does not setup application insights if no connection string', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = undefined
    const appInsights = require('../../app/insights')

    appInsights.setup()

    expect(useAzureMonitor).not.toHaveBeenCalled()
  })

  test('logs that Azure Monitor is not running if no connection string', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = undefined
    const appInsights = require('../../app/insights')

    appInsights.setup()

    expect(console.log).toHaveBeenCalledWith('Azure Monitor Not Running!')
  })

  test('does setup application insights if connection string present', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'
    const appInsights = require('../../app/insights')

    appInsights.setup()

    expect(useAzureMonitor).toHaveBeenCalledTimes(1)
  })

  test('calls useAzureMonitor with correct options', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'
    const appInsights = require('../../app/insights')

    appInsights.setup()

    expect(useAzureMonitor).toHaveBeenCalledWith({
      azureMonitorExporterOptions: {
        connectionString: 'test-connection-string',
      },
    })
  })

  test('logs that Azure Monitor is running if connection string present', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'
    const appInsights = require('../../app/insights')

    appInsights.setup()

    expect(console.log).toHaveBeenCalledWith('Azure Monitor (OpenTelemetry) Running')
  })
})
