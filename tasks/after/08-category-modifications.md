# Category Modifications

## Changes

### Backend
- **Gemini Logic**: Updated `gemini_service.py` to filter out spendings with negative amounts (credits/payments) *after* receiving the AI response.
- **Spending Updates**: 
    - Added `PATCH /api/spendings/<id>` endpoint to allow updating a single spending's category.
    - Added `PATCH /api/spendings` (bulk) endpoint to update multiple spendings at once. Accepts `{ "spending_ids": [...], "category_name": "..." }`.

### Frontend
- **Categories Page**:
    - "Other" category is now hidden from the list.
    - Added delete button for categories (except "Other").
- **Spendings Page**:
    - **Bulk Selection**: Added checkboxes to each row and a "Select All" checkbox in the header.
    - **Bulk Actions Bar**: A floating action bar appears when items are selected, allowing the user to choose a target category and apply it to all selected items.
    - **UX**: Removed the single-item dropdown edit in favor of the more robust bulk selection pattern (though single items can still be updated by selecting just one).

## Verification
1. **Negative Values**: Upload an invoice with negative values (e.g., payments). Verify they do not appear in the dashboard/spendings list.
2. **Category Management**:
    - Go to Categories page. Ensure "Other" is not listed.
    - Delete a category.
3. **Bulk Categorization**:
    - Go to Spendings page.
    - Select multiple spendings using the checkboxes.
    - Use the floating bar at the bottom to select a new category.
    - Click the checkmark button.
    - Verify the categories update immediately and persist after refresh.
