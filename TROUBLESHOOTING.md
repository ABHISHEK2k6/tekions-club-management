# 🚨 Troubleshooting: Sheet Not Accessible

## Current Issue
Your Google Sheet is returning a **400 Bad Request** error, which means it's not publicly accessible.

## Step-by-Step Fix

### 1. Open Your Google Sheet
Go to: https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/edit

### 2. Check Sharing Settings
1. Click the **"Share"** button (top-right corner)
2. Under "General access" it should say **"Anyone with the link"**
3. If it says "Restricted", click on it and change to **"Anyone with the link"**
4. Make sure the role is set to **"Viewer"**
5. Click **"Copy link"** and **"Done"**

### 3. Test Direct Access
Try opening this link in your browser:
```
https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/export?format=csv&gid=0
```

**Expected Result:** Should download a CSV file or show CSV data
**If it fails:** The sheet is still not public

### 4. Alternative: Get the Correct GID
Your sheet might be using a different tab. To find the correct GID:
1. Open your Google Sheet
2. Click on the tab at the bottom (Sheet1, Sheet2, etc.)
3. Look at the URL - it will show `#gid=XXXXXXX`
4. Replace `gid=0` in the CSV URL with your actual GID

### 5. Verify Your Data Structure
Make sure your sheet has:
- **Headers in Row 1** (Timestamp, Event ID, etc.)
- **Data starting from Row 2**
- **"Published" in the Publish Status column** for events you want to show

## Quick Tests

### Test 1: API Connectivity
Visit: http://localhost:3000/api/test/sheets
- ✅ If this works: API is fine, your sheet has permission issues
- ❌ If this fails: Network or API issue

### Test 2: Debug Your Sheet
Visit: http://localhost:3000/api/debug/sheets
- This will show exactly what error your sheet returns

### Test 3: Your Events API
Visit: http://localhost:3000/api/events/csv
- Check browser console for detailed error messages

## Common Solutions

### Solution 1: Organization Restrictions
If your Google account is part of an organization:
1. Try using a personal Google account
2. Or ask your admin to allow public sharing

### Solution 2: Wrong Sheet ID
1. Double-check the Sheet ID in your URL
2. Make sure you copied the entire ID between `/d/` and `/edit`

### Solution 3: Different Tab
1. Try changing `gid=0` to `gid=1` or `gid=2` etc.
2. Or look at the actual gid in your sheet URL

## Current Status
🔴 **Sheet Access**: Failed (400 error)
🟡 **API Code**: Ready and waiting
🟢 **Fallback**: Demo events showing

Once the sheet access is fixed, your real events will appear automatically!
