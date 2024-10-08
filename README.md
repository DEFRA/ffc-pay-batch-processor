# FFC Pay Batch Processor

## Description

FFC microservice acting as a Siti Agri adaptor to process batch files and send individual transactions as messages to an Azure Service Bus topic.

For how the repo fits into the architecture and what components or dependencies it interacts with please refer to the following diagram: [ffc-pay.drawio](https://github.com/DEFRA/ffc-diagrams/blob/main/Payments/ffc-pay.drawio)

# Prerequisites

## Software required

- Access to an instance of
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)
- Access to an instance of [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [Docker](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

Optional:
- [Kubernetes](https://kubernetes.io/docs/home/)
- [Helm](https://helm.sh/docs/)

## Configuration

### Azure Service Bus

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



## Azure Blob Storage

This repository polls for files from Azure Blob Storage within a `batch` container.

The following directories are automatically created within this container:

- `inbound` - polling location
- `archive` - successfully processed files
- `quarantine` - unsuccessfully processed files

## Payment batch file specification
### Siti Agri

A batch file comprises three different line types which exist on a one : many : many relationship.  i.e. each batch file will have:

- one batch line
- many header lines
- each header line can have many invoice lines

The format of each line type varies depending on the payment scheme.

##### Sustainable Farming Incentive
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `SFI` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. SFI + 8 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `SFI00123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | 8 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `00123456` |
| Payment Type | 1 | 5 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| FRN | 10 | 6 | Y | String | The unique customer identifier – Firm Reference Number |
| Calculation Currency | 3 | 7 | Y | String | This will always be `GBP` |
| Total value | 15,2 | 8 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 9 | Y | String | Allowed values: For example `NE00` (Natural England via Rural Payments Agency). |
| Payment preference currency | 3 | 10 | Y | String | Currency to be paid in is always `GBP` |
| Creator ID | 4 | 11 | Y | String | `SFI` |
| Payment Schedule | 3 | 12 | Y | String | `Q4` |
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A` |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Claim ID | 15 | 7 | Y | String | Same as header Claim ID `00123456` | 
| Delivery body | 4 | 8 | Y | String | Allowed values: For example `NE00`. As per Header Delivery body. |
| Convergence | 1 | 9 | Y | String | `N` = Convergence, or `N` = non-convergence. |
| Line ID | 3 | 10 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 11 | Y | String | Description of invoice line |
| Due date | 10 | 12 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |
| Batch to Customer Date | 10 | 13 | Y | Date | `yyyy-mm-dd`. Set to 15th dd  for Year 1 SFI Pilot. The payment cannot be made any earlier than this date (but can be later).Where due date does not apply and is left blank the system date will be used to pass to DAX to effect payment to customer. |
| Account Code | 6 | 14 | Y | String | `LLLNNN` i.e. `SOS273` |

##### Sustainable Farming Incentive Pilot
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `SFIP` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
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
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A`.|
| Fund | 5 | 6 | Y | String | `DRD10` |
| Agreement Number | 15 | 7 | Y | String | SIP + 12 digits. Unique number related to the Agreement. Start at next available number (sequence is shared across all SitiAgri schemes). For example `SIP000012345678` | 
| Delivery body | 4 | 8 | Y | String | Allowed values: For example `RP00` (Rural Payments Agency). As per Header Delivery body. |
| Convergence | 1 | 9 | Y | String | `N` = Convergence, or `N` = non-convergence. |
| Line ID | 3 | 10 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 11 | Y | String | Description of invoice line |
| Due date | 10 | 12 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |
| Batch to Customer Date | 10 | 13 | Y | Date | `yyyy-mm-dd`. Set to 15th dd  for Year 1 SFI Pilot. The payment cannot be made any earlier than this date (but can be later).Where due date does not apply and is left blank the system date will be used to pass to DAX to effect payment to customer. |
| Account Code | 6 | 14 | Y | String | `LLLNNN` i.e. `SOS273` |

##### Lump Sums Exit Scheme
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `LSES` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. LSES + 7 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `LSES0123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | L + 7 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `L0123456` |
| FRN | 10 | 6 | Y | String | The unique customer identifier – Firm Reference Number |
| Payment Type | 1 | 5 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| Total value | 15,2 | 6 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 7 | Y | String | Allowed values: For example `RP00` (Rural Payments Agency). |
| Payment preference currency | 3 | 8 | Y | String | Currency to be paid in is always `GBP` |
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A` |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Delivery body | 4 | 7 | Y | String | Allowed values: For example `RP00`. As per Header Delivery body. |
| Line ID | 3 | 8 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 9 | Y | String | Description of invoice line |
| Due date | 10 | 10 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |

##### Basic Payment Scheme
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `SITI AGRI SYS` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. SITI + 7 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `SITI0123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | C + 7 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `C0123456` |
| FRN | 10 | 5 | Y | String | The unique customer identifier – Firm Reference Number |
| Payment Type | 1 | 6 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| Total value | 15,2 | 7 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 8 | Y | String | Allowed values: For example `RP00` (Rural Payments Agency). |
| Payment preference currency | 3 | 9 | Y | String | Currency to be paid in is always `GBP` |
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A` |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Delivery body | 4 | 7 | Y | String | Allowed values: For example `RP00`. As per Header Delivery body. |
| Line ID | 3 | 8 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 9 | Y | String | Description of invoice line |
| Due date | 10 | 10 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |

##### Countryside Stewardship
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `SITI AGRI CS SYS` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. CS + 8 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `CS000123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | 8 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `A0123456` |
| Payment Type | 1 | 5 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| FRN | 10 | 6 | Y | String | The unique customer identifier – Firm Reference Number |
| Calculation Currency | 3 | 7 | Y | String | This will always be `GBP` |
| Total value | 15,2 | 8 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 9 | Y | String | Allowed values: For example `NE00` (Natural England via Rural Payments Agency). |
| Payment preference currency | 3 | 10 | Y | String | Currency to be paid in is always `GBP` |
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A` |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Agreement Number | 15 | 7 | Y | String | Unique agreement number | 
| Delivery body | 4 | 8 | Y | String | Allowed values: For example `NE00`. As per Header Delivery body. |
| Convergence | 1 | 9 | Y | String | `N` = Convergence, or `N` = non-convergence. |
| Line ID | 3 | 10 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 11 | Y | String | Description of invoice line |
| Due date | 10 | 12 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |
| Account Code | 6 | 13 | Y | String | `LLLNNN` i.e. `SOS273` |

##### Financial Discipline Mechanism Reimbursement
###### Batch line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `B` |
| Export date | 10 | 2 | Y | Date | `yyyy-mm-dd` |
| Number of invoices | 5 | 3 | Y | Integer | How many invoices are included within the batch |
| Batch value | 15,2 | 4 | Y | Decimal | Total net value of all invoices in batch |
| Batch ID | 4 | 5 | Y | String | Unique identifier of the batch |
| Creator ID | 16 | 6 | Y | String | `FDMR` |
| Invoice type | 2 | 7 | Y | String | `AP` |
 
###### Header line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `H` |
| Invoice number | 11 | 2 | Y | String | Also called transaction ID. FDMR + 7 digits. Start at next available number (sequence is shared across all SitiAgri schemes). For example `FDMR0123456` |
| Request Invoice Number | 2 | 3 | Y | String | Starts at 01, finishes at 99. First invoice request number will represent first payment request. Subsequent numbers will represent a correction or delta transaction. |
| Claim ID | 8 | 4 | Y | String | C + 7 digits. Unique number related to the payment. Start at next available number (sequence is shared across all SitiAgri schemes). For example `C0123456` |
| FRN | 10 | 5 | Y | String | The unique customer identifier – Firm Reference Number |
| Payment Type | 1 | 6 | Y | String | Unique number to identify payment. 1 = Request Invoice Number, 2 = Recovery/Reimbursement/Correction (currently derived in Matrix reporting from Request Invoice Number)
| Total value | 15,2 | 7 | Y | Decimal | Net value of invoice (sum of all invoice lines associated with the header) |
| Delivery body | 4 | 8 | Y | String | Allowed values: For example `RP00` (Rural Payments Agency). |
| Payment preference currency | 3 | 9 | Y | String | Currency to be paid in is always `GBP` |
 
###### Invoice line
 
| Name | Max | Length position | Is Mandatory | Data Type | Description |
| ---- | ---- | ---- | ---- | ---- | ---- |
| Line type | 1 | 1 | Y | Char | `L` |
| Invoice number | 11 | 2 | Y | String | As header |
| Value | 15,2 | 3 | Y | Decimal | Value of detail line |
| Marketing year | 4 | 4 | Y | Integer | `YYYY` - Calendar year to which the agreement payment relates |
| Scheme code | 5 | 5 | Y | String | Scheme structure is 5 digits eg. `12345` or `1234A` |
| Fund | 5 | 6 | Y | String | `DRD10` |
| Delivery body | 4 | 7 | Y | String | Allowed values: For example `RP00`. As per Header Delivery body. |
| Line ID | 3 | 8 | Y | String | Unique identifier to each line of the invoice that starts at 1 |
| Line type description | 60 | 9 | Y | String | Description of invoice line |
| Due date | 10 | 12 | Y | Date | `yyyy-mm-dd`. Set to 15th `dd` for Year 1 SFI Pilot. Due date to be the start date of the payment schedule. The payment cannot be made any earlier than this date |

## Setup

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for deployments to Kubernetes.

## Configuration

### Build container image

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
docker compose build
```

## How to start the Batch Processor

The service can be run using the convenience script:
```
./scripts/start
```

## How to get an output

There are several different possible outcomes depending on the input:

1. **Processing a valid payment file**  
**Input:** A valid payment file.  
**Output:** The transactions are logged, the payment file is moved from `inbound` to `archive`, and each valid [payment request](./docs/asyncapi.yaml) is sent to the Topic `PAYMENT_TOPIC_REQUEST`.  

2. **Processing a payment file with the wrong amount of requests**  
**Input:** A payment file where the amount of payment requests does not match the batch header.  
**Output:** An error message is logged and the payment file is moved from `inbound` to `quarantine`.  

3. **Processing a payment file with an invalid batch header**  
**Input:** A payment file with an invalid batch header (e.g. wrong date format)  
**Output:** An error message is logged and the payment file is moved from `inbound` to `quarantine`.  

4. **Processing a payment file with an invalid invoice line total**  
**Input:** A payment file where the batch header value matches the payment line values but one or more payment line does not match the corresponding invoice line total.  
**Output:** The valid payment requests are logged and error messages are logged for each invalid request, the payment file is moved from `inbound` to `archive`, each valid [payment request](./docs/asyncapi.yaml) is sent to Topic `PAYMENT_TOPIC_ADDRESS`, and an invalid event is sent to `EVENT_TOPIC_ADDRESS` for each invalid payment request.  

5. **Processing a payment file with an unexpected sequence number**  
**Input:** A payment file where the batch header sequence number is different from the expected value.  
**Output:** If the sequence number is lower than the expected value the payment file is ignored. If the sequence number is higher than the expected value the payment file is quarantined. A message is logged stating that the payment file has been ignored or quarentined accordingly.  

## How to stop the Batch Processor

This serivice can be stopped in different ways:
- [Bring the service down](#bring-the-service-down)
- [Bring the service down and clear its data](#bring-the-service-down-and-clear-its-data)

### Bring the service down  
`docker compose down`  

### Bring the service down and clear its data  
`docker compose down -v`  

## How to test the Batch Processor

### Running tests

Tests can be run in several modes:
- [Run tests and exit](#run-tests-and-exit)
- [Run tests with file watch](#run-tests-with-file-watch)
- [Run tests with debug](#run-tests-with-debug)

### Run tests and exit
```
scripts/test
```

### Run tests with file watch
```
scripts/test -w
```

### Run tests with debug
```
scripts/test -d
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
