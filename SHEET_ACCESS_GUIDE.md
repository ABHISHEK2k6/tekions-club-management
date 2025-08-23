# Google Sheets Access Troubleshooting Guide

## Current Issue
Your Google Sheet is returning a 400 error even though it's marked as "public". This is a common issue with several possible solutions.

## Quick Fixes to Try

### Method 1: Proper Public Sharing
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/edit
2. Click the **"Share"** button (top right)
3. Under "General access", select **"Anyone with the link"**
4. Set permission to **"Viewer"**
5. Make sure it says **"Anyone on the internet with this link can view"**
6. Click **"Done"**

### Method 2: Publish to Web (Recommended)
1. In your Google Sheet, go to **File → Share → Publish to web**
2. In the first dropdown, select **"Entire Document"** or your specific sheet
3. In the second dropdown, select **"Comma-separated values (.csv)"**
4. Check **"Automatically republish when changes are made"**
5. Click **"Publish"**
6. Copy the published URL (it will look different from your edit URL)

### Method 3: Check Organization Restrictions
If you're using a work or school Google account:
1. Your organization might block public sharing
2. Try with a personal Google account instead
3. Or ask your IT admin to allow public sharing

## Testing Your Fix

After trying the above methods, test these URLs in your browser:

1. **Standard CSV export:**
   ```
   https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/export?format=csv&gid=0
   ```

2. **Published web CSV:**
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/pub?output=csv
   ```

If these URLs show your CSV data in the browser, the API will work too!

## Debug Endpoints

Use these to test different access methods:
- http://localhost:3000/api/debug/sheet-access (comprehensive test)
- http://localhost:3000/api/debug/papaparse (parser test)

## Common Issues

### 400 Bad Request
- Sheet isn't truly public
- Organization restrictions
- Wrong sharing permissions

### 404 Not Found
- Sheet ID is incorrect
- Sheet was deleted or moved

### Empty Response
- Sheet is empty
- Wrong sheet tab (gid parameter)

## Expected Sheet Structure

Your CSV should have these headers:
- Event Name
- About Event  
- Event Date
- Event Time
- Venue
- Event Image
- Event Status

## Next Steps

1. Try Method 2 (Publish to web) first - this usually works best
2. Test the published URL in your browser
3. Check our debug endpoints
4. Once working, we'll update the main API to use the correct URL format

Let me know which method works for you!
