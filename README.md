# GST Filing Automation

## Overview
This project **automates the GST filing process** by leveraging updates in the **Firebase database**. It streamlines the submission process, reducing manual effort and ensuring accuracy. 

By simply modifying a payload and providing a valid **GSTIN number**, users can automate their GST filings effectively.

## Prerequisites
- A **valid GSTIN number**
- Access to **Firebase** and **Cloud Functions**
- **Node.js** environment for deploying and modifying Cloud Functions
- Access to the **ClearTax sandbox environment** for testing

## How It Works
The automation process relies on **Firebase triggers** to initiate GST filing based on changes detected in the database. Users are required to modify the payload as per the structure provided below.

**Note:** This project uses the **ClearTax sandbox environment** for testing. To file GST, you need a **GSTIN number** and an **auth token**. For more information on generating an auth token, please refer to the ClearTax documentation: [Access Token Guide](https://docs.cleartax.in/cleartax-docs/clear-finance-cloud/learn-clear-finance-cloud-basics/access-token).

## Payload Structure
Ensure the payload in the following format is updated in the file path:

**Directory:** `CloudFunction/function/index.js`

### Example Payload:
```json
{
    "userInputArgs": {
        "templateId": "618a5623836651c01c1498ad", 
        "groupId": "TEST123",
        "settings": {
            "ignoreHsnValidation": true
        }
    }, 
    "jsonRecords": [
        {
            "documentType": "Invoice", 
            "documentDate": "2022-11-29", 
            "documentNumber": "Inv-123", 
            
            "erpSource": "Tally", 
            "voucherNumber": "Inv-123", 
            "voucherDate": "2022-11-29", 
            
            "isBillOfSupply": "N", 
            "isReverseCharge": "N", 
            "isDocumentCancelled": "N", 

            "supplierName": "Defmacro Software Private Limited", 
            "supplierGstin": "29AAFCD5862R1ZR", 

            "customerName": "Clearsharp Technology Private Limited", 
            "customerAddress": "Cust1 Mst Addr1, Cust1 Mst Addr2, Cust1 Mst Addr3", 
            "customerState": "Karnataka", 
            "customerGstin": "29AAECC3822D1ZY", 
            "placeOfSupply": "Karnataka", 

            "itemDescription": "Item1", 
            "itemCategory": "G", 
            "hsnSacCode": "48", 
            "itemQuantity": 500, 
            "itemUnitCode": "PCS", 
            "itemUnitPrice": 250, 
            "itemDiscount": 0, 
            "itemTaxableAmount": 125000, 
            "cgstRate": 9, 
            "cgstAmount": 11250, 
            "sgstRate": 9, 
            "sgstAmount": 11250, 
            "igstRate": 0, 
            "igstAmount": 0, 
            "cessRate": 0, 
            "cessAmount": 0, 

            "documentTotalAmount": 147500
        }
    ]
}
```

## Deployment Steps
1. **Clone** the repository to your local machine.
2. Navigate to the `function` directory.
3. Modify the `index.js` file to include the desired payload.
4. Deploy the Cloud Function by running the following command:
   ```bash
   firebase deploy --only functions
   ```
5. Monitor the **Firebase logs** to ensure the automation runs as expected.

## Testing and Production
- For **testing purposes**, you can use the Firebase emulator by running:
   ```bash
   firebase emulators:start
   ```
- For **actual production deployment**, a **paid Firebase plan** is required to enable Cloud Functions.
- Don't forget to paste your **`serviceAccountKey.json`** file in the **`GST` directory** to authenticate and access Firebase services.

## Notes
- Ensure that all **mandatory fields** in the payload are populated correctly.
- Double-check the **GSTIN number** for accuracy to avoid submission errors.

## Support
For further assistance, feel free to **open an issue** or contact the project maintainer.

---

**Happy Filing! 🚀**

