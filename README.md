# FFC Payment Batch Processor

FFC service to process Siti Agri batch files and send individual transactions as messages.

## Prerequisites

- Access to an instance of an
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)(ASB).
- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

## Azure Service Bus

This service depends on a valid Azure Service Bus connection string for
asynchronous communication.  The following environment variables need to be set
in any non-production (`!config.isProd`) environment before the Docker
container is started or tests are run. 

When deployed into an appropriately configured AKS
cluster (where [AAD Pod Identity](https://github.com/Azure/aad-pod-identity) is
configured) the microservice will use AAD Pod Identity through the manifests
for
[azure-identity](./helm/ffc-pay-batch-processor/templates/azure-identity.yaml)
and
[azure-identity-binding](./helm/ffc-pay-batch-processor/templates/azure-identity-binding.yaml).

| Name | Description |
| ---| --- |
| MESSAGE_QUEUE_HOST | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net` |
| MESSAGE_QUEUE_PASSWORD | Azure Service Bus SAS policy key |
| MESSAGE_QUEUE_USER     | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey` |
| MESSAGE_QUEUE_SUFFIX | Developer initials |

### Example output message

```
{
  "sourceSystem": "SFIP",
  "sbi": 123456789,
  "frn": 1234567890
  "marketingYear": 2022,
  "paymentRequestNumber": 1,
  "invoiceNumber": "SFI12345678",
  "agreementNumber": "SFI12345",
  "contractNumber": "SFI12345",
  "currency": 'GBP",
  "schedule": "Q4",
  "dueDate": "09/11/2022",
  "value": 1000.00,
  "invoiceLines": [{
    "schemeCode": "80001",
    "description": "G00 - Gross value of claim",
    "value": 1000.00
  }]
}
```

## Azure Storage

This repository polls for files from Azure Blob Storage within a `batch` container.

The following directories are automatically created within this container:

- `inbound` - polling location
- `archive` - successfully processed files
- `quarantine` - unsuccessfully processed files

## Payment batch file specification
### SFI Pilot
#### Example file
Filename: `SITIELM0001_AP_20210812105404541.dat`
```
B^2021-08-12^2^200^0001^SFIP^AP
H^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12
L^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273
H^SFI00000002^01^SFIP000002^1^1000000002^GBP^100^RP00^GBP^SFIP^M12
L^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273
```

#### Specification

A batch file comprises three different line types which exist on a one : many : many relationship.  i.e. each batch file will have:

- one batch line
- many header lines
- each header line can have many invoice lines.

##### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `SFIP` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
##### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. SFIP + 7 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `SFIP0123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | S + 7 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `S0123456` |
| Payment Type | 1 | 5 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| FRN | 10 | 6 | Y | String | The unique customer identifier – Firm Reference Number |
| Calculation Currency | 3 | 7 | Y | String | This will always be `GBP` |
| Total value | 15,2 | 8 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 9 | Y | String | Allowed values: For example `RP00` (Rural Payment Agency). |
| Payment preference currency | 3 | 10 | Y | String | Currency to be paid in is always `GBP` |
| Creator ID | 4 | 11 | Y | String | `SFIP` |
| Payment Schedule | 3 | 12 | Y | String | `Q4` |
 
##### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID.Should match corresponding header value. SFIP + 7 digits. Start at next available number (sequence is shared across all SitiAgri schemes) For example `SFIP0123456` |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A`.  See valid SFI Pilot schemes below. |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Agreement Number | 15 | 7 | Y | String | SIP + 12 digits. Unique number related to the Agreement. Start at next available number (sequence is shared across all SitiAgri schemes). For example `SIP000012345678` | 
|Delivery body | 4 | 8 | Y | String | Allowed values: For example `RP00` (Rural Payments Agency). As per Header Delivery body. |
| Line ID | 3 | 10 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 11 | Y | String | Description of invoice line |
|Due date | 10 | 12 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |
| Batch to Customer Date | 10 | 13 | Y | Date | `yyyy-mm-dd`. Set to 15th dd  for Year 1 SFI Pilot. The payment cannot be made any earlier than this date (but can be later).Where due date does not apply and is left blank the system date will be used to pass to DAX to effect payment to customer. |
| Account Code | 6 | 14 | Y | String | `LLLNNN` i.e. `SOS273` |

##### Line type descriptions

| Line type | Description |
| ---- | ---- |
| `G00 - Gross value of claim` | Positive Value |
| `P02 - Over declaration penalty` | Negative Value |
| `P05 - Late claim submission penalty` | Negative Value |
| `P06 - Late change penalty` | Negative Value |
| `P08 - Non declaration of land penalty` | Negative Value |
| `P22 - Rural Development refusals` | Negative Value |
| `P23 - Rural Development withdrawals` | Negative Value |
| `P24 - Over Declaration reduction` | Negative Value |

##### Scheme codes

| Scheme | Code |
| ---- | ---- |
| Arable and Horticultural Land | 80001 |
| Arable and Horticultural Soils| 80002 |
| Hedgerow | 80003 |
| Improved Grassland Soils | 80004 |
| Improved Grassland | 80005 |
| On Farm Woodland | 80006 |
| Low and no input Grassland | 80007 |
| Water body Buffering | 80008 |
| Pilot Participation Payment | 80009 |

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start

Use Docker Compose to run service locally.

The service uses [Liquibase](https://www.liquibase.org/) to manage database migrations. To ensure the appropriate migrations have been run the utility script `scripts/start` may be run to execute the migrations, then the application.

Alternatively the steps can be run manually:
* run migrations
  * `docker-compose -f docker-compose.migrate.yaml run --rm database-up`
* start
  * `docker-compose up`
* stop
  * `docker-compose down` or CTRL-C

Additional Docker Compose files are provided for scenarios such as linking to other running services.

Link to other services:
```
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
