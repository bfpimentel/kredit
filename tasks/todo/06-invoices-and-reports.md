# Invoices and Reports

You'll be working on the project given the following requirements.

Please keep strict to the requirements and don't make any changes besides the mentioned scopes.

## 1. Backend

1. Allow me to configure a Gemini API key in the .env file.
2. Call Gemini to process the uploaded invoice with the following information:
    1. The file that has been imported is a Credit Card invoice. 
    2. You should interpret the invoice and focus only on the spendings of the respective invoice.
    3. These are the categories which you should use for categorizing each of the entries: (NOTE FOR OPENCODE: You should insert here the categories that the user configured earlier)
    4. The output MUST be a JSON in the following format:
        ```
        [
            {
                "name": <spending_name>,
                "category": <spending_category>,
                "date": <spending_date>,
                "amount": <spending_amount>
            }
            ...
        ]
        ```
    5. If none of the categories are fit to the spending, please set it as "Other".
    6. Pay attention to the language of the invoice, you'll need it to decide which is the best category.
3. Save the output for the user. For now, you don't need to save the actual invoice file.
4. Besides what Gemini needs to return, you should add:
    1. A field called "import_date". This is important since an invoice can contain spendings in installments.
    2. An unique id.
5. Call Gemini the best way you can, use system prompts if needed or whatever you decide is the best.

## 2. Web

Rule 1: You should always import typescript files using the '@/' alias instead of using relative imports.
Rule 2: You should always follow the prettier styling options.

1. The user should be able to import credit card invoices.
2. Under the user "Dashboard", plot a graph report for each of the categories.
3. Allow the user to filter the month of the report.
4. Allow the user to delete categories.
5. Set around 10 default categories for new users. You can decide them. You might need to change something in the backend as well.
6. Protect the "Other" category. User shouldn't be able to delete nor add it.
7. Create a "Spendings" menu that will allow the user to list all spendings in a given month.


## Finishing steps

1. Create a markdown file with relevant information from the steps you've done in @/tasks/after. Please set the output filename to the same as you are reading right now.
