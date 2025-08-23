# Google Sheets Events Integration

This project now fetches event data from Google Sheets instead of static data. Here's how to set it up:

## Quick Setup (CSV Method - No API Keys Required)

1. **Prepare your Google Sheet:**
   - Make sure your sheet is publicly accessible (Share > Anyone with the link can view)
   - Your sheet should have the following columns (in this order):
     ```
     Title | Description | Date | End Date | Location | Max Participants | Current Participants | Category | Club Name | Club ID | Image | Registration Link
     ```

2. **Update the Sheet ID:**
   - Copy your Google Sheets URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Replace `YOUR_SHEET_ID` in `/app/api/events/csv/route.ts` with your actual sheet ID

3. **Test the integration:**
   - Start your development server: `npm run dev`
   - Go to `/dashboard` or `/events` to see the data from your sheet

## Advanced Setup (API Method - Requires Google Cloud Setup)

If you prefer using the Google Sheets API (more reliable, supports private sheets):

1. **Set up Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Sheets API

2. **Create API Key:**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API key

3. **Configure Environment:**
   - Copy `.env.example` to `.env.local`
   - Add your API key: `GOOGLE_SHEETS_API_KEY=your_api_key_here`

4. **Update API Route:**
   - Modify `/hooks/use-events.ts` to use `/api/events/sheets` instead of `/api/events/csv`

## Google Sheet Format

Your sheet should look like this:

| Title | Description | Date | End Date | Location | Max Participants | Current Participants | Category | Club Name | Club ID | Image | Registration Link |
|-------|-------------|------|----------|----------|------------------|---------------------|----------|-----------|---------|-------|-------------------|
| Gaming Tournament | Annual esports event | 2024-02-15T14:00:00Z | 2024-02-15T18:00:00Z | Gaming Arena | 50 | 25 | Gaming | Gaming Club | gaming | | https://example.com/register |
| Tech Workshop | Learn React | 2024-02-20T10:00:00Z | | Tech Lab | 30 | 15 | Technology | Tech Club | tech | | |

## Important Notes

1. **Date Format:** Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) for dates
2. **Public Access:** For CSV method, sheet must be publicly accessible
3. **Caching:** Events are cached for performance, may take a few minutes to update
4. **Fallback:** If sheet is inaccessible, fallback demo events will be shown

## Troubleshooting

- **No events showing:** Check if your sheet is public and the sheet ID is correct
- **Wrong data:** Verify column order matches the expected format
- **API errors:** Check browser console for detailed error messages
- **Empty events:** Make sure first row contains headers, data starts from row 2

## Column Descriptions

- **Title:** Event name (required)
- **Description:** Event description
- **Date:** Start date/time in ISO format (required)
- **End Date:** Optional end date/time
- **Location:** Event venue (required)
- **Max Participants:** Maximum number of participants (optional)
- **Current Participants:** Current registered count
- **Category:** Event category (e.g., Gaming, Technology, Sports)
- **Club Name:** Organizing club name
- **Club ID:** Unique club identifier
- **Image:** URL to event image (optional)
- **Registration Link:** External registration URL (optional)
