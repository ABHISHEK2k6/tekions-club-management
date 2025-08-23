# 🔧 Google Sheets Setup Instructions

## Step 1: Make Your Sheet Public

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/edit`

2. Click **"Share"** button (top-right corner)

3. Click **"Change to anyone with the link"**

4. Make sure it's set to **"Anyone with the link"** and **"Viewer"** access

5. Click **"Copy link"** and **"Done"**

## Step 2: Verify Your Sheet Structure

Your sheet should have these columns in **Row 1** (headers):

| Timestamp | Event ID | Email Address | Event Name | Event Description | Cover Image | Event Organiser | Event Date and Time | Event Type | Event Registration/Info Link | Venue | Publish Status | RSVP? | Custom Confirmation Text | External RSVP Link | Enable Check-Ins? | Total Allowed Participants | Custom RSVP Question |

**✅ Perfect!** Your current headers match this structure.

## Step 3: Add Sample Data

Make sure your events have data in these key columns:
- **Event Name** (Column D): Your event title
- **Event Description** (Column E): Event details
- **Event Date and Time** (Column H): Use format like `2025-09-01 2:00:00 PM` or `2025-09-01T14:00:00Z`
- **Venue** (Column K): Event location
- **Event Organiser** (Column G): Club/organization name
- **Event Type** (Column I): Category like "Gaming", "Technology", "Sports"
- **Publish Status** (Column L): Must be "Published" (not "Draft")
- **Total Allowed Participants** (Column Q): Number like `50`

## Step 4: Test the Connection

1. Visit: http://localhost:3000/api/debug/sheets
2. This will show you exactly what's happening with your sheet

## Step 5: Update the Code (if needed)

If your sheet has a different ID, update it in `/app/api/events/csv/route.ts`:

```typescript
const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID';
```

## Common Issues & Solutions

### ❌ 400 Error
- **Problem**: Sheet is not public or doesn't exist
- **Solution**: Make sure sharing is set to "Anyone with the link"

### ❌ Empty Data
- **Problem**: Wrong sheet tab (gid) or no data
- **Solution**: Check if you're using the first sheet (gid=0)

### ❌ Wrong Format
- **Problem**: Dates not showing correctly
- **Solution**: Use ISO format: `2025-09-01T14:00:00Z`

## Quick Test URLs

Test these URLs in your browser:

1. **Debug API**: http://localhost:3000/api/debug/sheets
2. **Events API**: http://localhost:3000/api/events/csv
3. **Direct CSV**: https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/export?format=csv&gid=0

If the Direct CSV link doesn't work in your browser, the sheet isn't public yet.

## Current Status

🟡 **Using Demo Data** - Your sheet connection needs to be set up

Once configured correctly, you'll see:
- ✅ Real events from your Google Sheet
- ✅ Dynamic categories based on your data
- ✅ Auto-updating content when you modify the sheet
