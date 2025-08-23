// Google Sheets configuration
const SHEET_ID = '1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI';
const SHEET_NAME = 'Sheet1'; // Change this to your actual sheet name if different
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY; // You'll need to add this to your .env.local

interface SheetEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  category: string;
  clubName: string;
  clubId: string;
  image?: string;
  registrationLink?: string;
}

export async function GET() {
  try {
    if (!API_KEY) {
      console.error('Google Sheets API key not found');
      return new Response(
        JSON.stringify({ error: 'API configuration missing' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.values || data.values.length === 0) {
      return new Response(
        JSON.stringify({ events: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the spreadsheet data
    const [headers, ...rows] = data.values;
    
    const events: SheetEvent[] = rows.map((row: string[], index: number) => {
      // Map spreadsheet columns to event properties
      // Adjust these indices based on your actual spreadsheet structure
      return {
        id: `sheet-${index + 1}`,
        title: row[0] || '',
        description: row[1] || '',
        date: row[2] || '',
        endDate: row[3] || '',
        location: row[4] || '',
        maxParticipants: row[5] ? parseInt(row[5]) : undefined,
        currentParticipants: row[6] ? parseInt(row[6]) : 0,
        category: row[7] || 'General',
        clubName: row[8] || 'Unknown Club',
        clubId: row[9] || 'unknown',
        image: row[10] || '',
        registrationLink: row[11] || '',
      };
    }).filter(event => event.title); // Filter out empty rows

    return new Response(
      JSON.stringify({ events }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching events from Google Sheets:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch events from Google Sheets' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Alternative implementation using CSV format (if you publish the sheet as CSV)
export async function getEventsFromCSV() {
  try {
    // If you publish your Google Sheet as CSV, you can use this URL format:
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const [headers, ...rows] = lines;
    
    const events = rows.map((row, index) => {
      const columns = row.split(',');
      return {
        id: `csv-${index + 1}`,
        title: columns[0]?.replace(/"/g, '') || '',
        description: columns[1]?.replace(/"/g, '') || '',
        date: columns[2]?.replace(/"/g, '') || '',
        endDate: columns[3]?.replace(/"/g, '') || '',
        location: columns[4]?.replace(/"/g, '') || '',
        maxParticipants: columns[5] ? parseInt(columns[5].replace(/"/g, '')) : undefined,
        currentParticipants: columns[6] ? parseInt(columns[6].replace(/"/g, '')) : 0,
        category: columns[7]?.replace(/"/g, '') || 'General',
        clubName: columns[8]?.replace(/"/g, '') || 'Unknown Club',
        clubId: columns[9]?.replace(/"/g, '') || 'unknown',
        image: columns[10]?.replace(/"/g, '') || '',
        registrationLink: columns[11]?.replace(/"/g, '') || '',
      };
    }).filter(event => event.title);

    return { events };
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    throw error;
  }
}
