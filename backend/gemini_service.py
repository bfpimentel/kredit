import os
import json
import uuid
from datetime import datetime, timezone
from google import genai
from models import Category, Spending, Invoice
from database import db_session

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


def process_invoice_with_gemini(file_content: bytes, user_id: int, invoice_id: int):
    """
    Processes the invoice file using Gemini API to extract spendings.
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")

    client = genai.Client(api_key=GEMINI_API_KEY)

    # Fetch user categories
    user_categories = Category.query.filter_by(user_id=user_id).all()
    category_names = [c.name for c in user_categories]

    # Ensure "Other" exists in the list for the prompt
    if "Other" not in category_names:
        category_names.append("Other")

    prompt = f"""
    The file provided is a Credit Card invoice. 
    Interpret the invoice and focus only on the spendings of the respective invoice.
    
    Categorize each entry using one of these categories: {", ".join(category_names)}.
    If none of the categories fit, use "Other".
    Pay attention to the language of the invoice to decide the best category.
    
    The output MUST be a JSON array in the following format:
    [
        {{
            "name": <spending_name>,
            "category": <spending_category>,
            "date": <spending_date in YYYY-MM-DD format>,
            "amount": <spending_amount as a number>
        }}
    ]
    Do not include markdown formatting like ```json ... ```. Just return the raw JSON string.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                genai.types.Content(
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                        genai.types.Part.from_bytes(
                            data=file_content, mime_type="application/pdf"
                        ),
                    ]
                )
            ],
        )

        response_text = response.text
        if response_text:
            response_text = response_text.strip()
        else:
            raise Exception("Empty response from Gemini")

        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        print(response_text)

        spendings_data = json.loads(response_text)

        processed_spendings = []
        import_date = datetime.now(timezone.utc)

        for item in spendings_data:
            amount = float(item["amount"])
            if amount < 0:
                continue

            category_name = item.get("category", "Other")
            category = next(
                (c for c in user_categories if c.name == category_name), None
            )

            category_id = category.id if category else None

            if not category_id:
                other_cat = Category.query.filter_by(
                    user_id=user_id, name="Other"
                ).first()
                if other_cat:
                    category_id = other_cat.id

            spending = Spending(
                id=str(uuid.uuid4()),
                name=item["name"],
                date=datetime.strptime(item["date"], "%Y-%m-%d").date(),
                amount=amount,
                category_id=category_id,
                import_date=import_date,
                invoice_id=invoice_id,
                user_id=user_id,
            )
            db_session.add(spending)
            processed_spendings.append(spending)

        db_session.commit()
        return processed_spendings

    except Exception as e:
        print(f"Error processing invoice with Gemini: {e}")
        raise e
