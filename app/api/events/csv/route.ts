// Improved API route using PapaParse for reliable CSV parsing
import Papa from 'papaparse';

// Google Sheets configuration - USING YOUR EXACT PUBLISHED URL
// This is the working URL you got from "File link → Share → Publish to web"
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYpTbfVmoIa8A8hv8PMCkZZgjYa83HPcKCKdtr4cYx0BePB2dGB1oLMDxde1lh2-w4-lU0HI8s3LVQ/pub?gid=134556088&single=true&output=csv';

// Alternative: You can also try the "shareable" CSV link format
// const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&usp=sharing`;

console.log('📊 Configured Google Sheets URL:', CSV_URL);

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

interface CSVRow {
  [key: string]: string;
}

export async function GET() {
  try {
    console.log('📊 Fetching events from Google Sheets CSV...');
    console.log('🔗 URL:', CSV_URL);
    
    const response = await fetch(CSV_URL, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      console.error('🔗 Response URL:', response.url);
      
      // Try to get error details
      const errorText = await response.text();
      console.error('💬 Error response:', errorText);
      
      // More specific error messages
      if (response.status === 400) {
        console.error('🚨 400 Error - Sheet is not public or ID is wrong');
        console.error('💡 Solution: Make sure your sheet is shared as "Anyone with the link can view"');
      } else if (response.status === 403) {
        console.error('🚨 403 Error - Permission denied');
        console.error('💡 Solution: Check sharing permissions on your Google Sheet');
      } else if (response.status === 404) {
        console.error('🚨 404 Error - Sheet not found');
        console.error('💡 Solution: Verify the Sheet ID in the URL');
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const csvText = await response.text();
    console.log('📄 CSV Response received, length:', csvText.length);
    console.log('📄 First 200 characters:', csvText.substring(0, 200));
    
    if (!csvText || csvText.trim().length === 0) {
      console.warn('Empty CSV response');
      return new Response(
        JSON.stringify({ events: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse CSV using PapaParse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.error('📊 CSV Parse Errors:', parseResult.errors);
    }

    console.log('📋 Headers found:', Object.keys(parseResult.data[0] || {}));
    console.log('📊 Number of data rows:', parseResult.data.length);

    const events: SheetEvent[] = parseResult.data.map((row: CSVRow, index: number) => {
      // Better date parsing for Google Sheets formats
      const rawDate = row['Event Date and Time']?.trim() || '';
      let processedDate = rawDate;
      
      if (rawDate) {
        console.log(`📅 Processing date for event ${index + 1}: "${rawDate}"`);
        
        let parsed: Date;
        
        // Force DD/MM/YYYY parsing for slash-separated dates
        const slashDate = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.+))?$/);
        if (slashDate) {
          const [, day, month, year, time] = slashDate;
          // ALWAYS treat as DD/MM/YYYY format
          processedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          if (time) {
            processedDate += `T${time}`;
          } else {
            processedDate += 'T12:00:00.000Z';
          }
          console.log(`🔄 Forced DD/MM/YYYY parsing: ${day}/${month}/${year} -> ${processedDate}`);
          parsed = new Date(processedDate);
        }
        // Try YYYY-MM-DD format (ISO)
        else if (rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(.+))?$/)) {
          processedDate = rawDate.includes('T') ? rawDate : rawDate + 'T12:00:00.000Z';
          parsed = new Date(processedDate);
          console.log(`🔄 Parsed as ISO format: ${processedDate}`);
        }
        // Try direct parsing as fallback
        else {
          parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            processedDate = parsed.toISOString();
            console.log(`🔄 Direct parsing worked: ${processedDate}`);
          }
        }
        
        if (!isNaN(parsed.getTime())) {
          processedDate = parsed.toISOString();
          console.log(`✅ Final processed date: ${processedDate}`);
        } else {
          console.log(`❌ All parsing methods failed for: "${rawDate}"`);
          processedDate = rawDate;
        }
      }

      // Map columns based on your actual sheet structure
      const eventData = {
        id: row['Event ID']?.trim() || `event-${index + 1}`,
        title: row['Event Name']?.trim() || '',
        description: row['Event Description']?.trim() || '',
        date: processedDate,
        endDate: '', // Not available in your sheet
        location: row['Venue']?.trim() || '',
        maxParticipants: row['Total Allowed Participants'] ? parseInt(row['Total Allowed Participants']) || undefined : undefined,
        currentParticipants: 0, // Not available in your sheet, defaulting to 0
        category: row['Event Type']?.trim() || 'General',
        clubName: row['Event Organiser']?.trim() || 'Unknown Club',
        clubId: (row['Event Organiser']?.trim() || 'unknown').toLowerCase().replace(/\s+/g, '-'),
        image: row['Cover Image']?.trim() || '',
        registrationLink: row['Event Registration/Info Link']?.trim() || row['External RSVP Link']?.trim() || '',
      };

      // Log the first few events for debugging
      if (index < 3) {
        console.log(`📝 Event ${index + 1}:`, eventData);
      }

      return eventData;
    }).filter((event, index) => {
      const row = parseResult.data[index] as CSVRow;
      const publishStatus = row['Publish Status']?.trim().toLowerCase() || '';
      const isPublished = publishStatus === 'published' || publishStatus === 'publish' || publishStatus === 'yes';
      
      return event.title && isPublished;
    }); // Filter out empty rows and unpublished events

    console.log(`Parsed ${events.length} events from CSV`);

    return new Response(
      JSON.stringify({ events }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error fetching events from Google Sheets CSV:', error);
    console.error('📋 Please check:');
    console.error('   1. Sheet is publicly accessible (Share > Anyone with link can view)');
    console.error('   2. Sheet ID is correct in the URL');
    console.error('   3. Sheet has the correct column structure');
    console.error('   4. First row contains headers, data starts from row 2');
    
    // Return fallback events with helpful information
    const fallbackEvents: SheetEvent[] = [
      {
        id: 'demo-1',
        title: '🚨 Demo Event - Sheet Not Connected',
        description: 'This is a demo event showing because your Google Sheet is not accessible. Please check the setup instructions.',
        date: '2025-09-01T14:00:00Z',
        location: 'Setup Required',
        currentParticipants: 0,
        maxParticipants: 100,
        category: 'Setup',
        clubName: 'System Message',
        clubId: 'system',
        registrationLink: '',
      },
      {
        id: 'demo-2',
        title: '📊 Sample Gaming Tournament',
        description: 'This is how your events will look once connected to Google Sheets',
        date: '2025-09-15T10:00:00Z',
        location: 'Gaming Arena',
        currentParticipants: 25,
        maxParticipants: 50,
        category: 'Gaming',
        clubName: 'Gaming Club',
        clubId: 'gaming',
        registrationLink: 'https://example.com/register',
      },
      {
        id: 'demo-3',
        title: '💻 Tech Workshop Example',
        description: 'Learn about modern web development technologies',
        date: '2025-09-20T09:00:00Z',
        location: 'Tech Lab',
        currentParticipants: 15,
        maxParticipants: 30,
        category: 'Technology',
        clubName: 'Tech Club',
        clubId: 'tech',
        registrationLink: '',
      },
    ];

    return new Response(
      JSON.stringify({ 
        events: fallbackEvents,
        message: 'Using demo data - Google Sheets not accessible'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
