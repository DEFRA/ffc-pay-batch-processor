Feature:
  As a payment service
  I want to validate and extract the payment requests from batch files and convert them to transactions
  so that the transactions can be processed in the Payment Service


  Scenario: Service will produce a Business Transaction object in JSON Format
    Given a batch file is received
    When the file is processed
    Then a Business Transaction object is generated

