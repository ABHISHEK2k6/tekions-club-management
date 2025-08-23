import Papa from 'papaparse';

// Google Sheets configuration - Using the exact published URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYpTbfVmoIa8A8hv8PMCkZZgjYa83HPcKCKdtr4cYx0BePB2dGB1oLMDxde1lh2-w4-lU0HI8s3LVQ/pub?gid=134556088&single=true&output=csv';

interface CSVRow {
  [key: string]: string;
}

interface SheetEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  category: string;
  clubName: string;
  clubId: string;
  image?: string;
  registrationLink?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Fetching single event with ID:', id);
    
    // Fetch CSV data from Google Sheets
    const response = await fetch(CSV_URL, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch CSV:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch event data from Google Sheets' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const csvText = await response.text();
    console.log('📄 CSV data length:', csvText.length);

    // Parse CSV using PapaParse - same as main events endpoint
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.error('📊 CSV Parse Errors:', parseResult.errors);
    }

    console.log('📋 Headers found:', parseResult.errors.length > 0 ? 0 : Object.keys(parseResult.data[0] || {}).length);
    console.log('� Total events parsed:', parseResult.data.length);

    // Parse data rows
    const events: SheetEvent[] = parseResult.data.map((row: CSVRow, index: number) => {
      // Check if this event is published
      const publishStatus = row['Publish Status']?.trim().toLowerCase() || '';
      const isPublished = publishStatus === 'published' || publishStatus === 'publish' || publishStatus === 'yes';
      
      if (!isPublished || !row['Event Name']?.trim()) {
        return null;
      }

      // Better date parsing for Google Sheets formats
      const rawDate = row['Event Date and Time']?.trim() || '';
      let processedDate = rawDate;
      
      if (rawDate) {
        console.log(`📅 Processing date for event ${index + 1}: "${rawDate}"`);
        
        // Force DD/MM/YYYY format parsing for Google Sheets
        const slashDate = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.+))?$/);
        if (slashDate) {
          const [, day, month, year, time] = slashDate;
          processedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          if (time) {
            processedDate += `T${time}`;
          } else {
            processedDate += 'T12:00:00';
          }
          
          console.log(`🔄 Forced DD/MM/YYYY parsing: ${day}/${month}/${year} -> ${processedDate}`);
          
          const parsed = new Date(processedDate);
          if (!isNaN(parsed.getTime())) {
            processedDate = parsed.toISOString();
            console.log(`✅ Final processed date: ${processedDate}`);
          }
        }
      }

      const eventData: SheetEvent = {
        id: row['Event ID']?.trim() || `event-${index}`,
        title: row['Event Name']?.trim() || '',
        description: row['Event Description']?.trim() || '',
        date: processedDate,
        endDate: '',
        location: row['Venue']?.trim() || '',
        maxParticipants: row['Total Allowed Participants'] ? parseInt(row['Total Allowed Participants']) || undefined : undefined,
        currentParticipants: 0,
        category: row['Event Type']?.trim() || 'General',
        clubName: row['Event Organiser']?.trim() || 'Unknown Club',
        clubId: (row['Event Organiser']?.trim() || 'unknown').toLowerCase().replace(/\s+/g, '-'),
        image: row['Cover Image']?.trim() || '',
        registrationLink: row['Event Registration/Info Link']?.trim() || row['External RSVP Link']?.trim() || '',
      };

      console.log(`📝 Event ${index + 1}:`, {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description.substring(0, 100) + '...',
        date: eventData.date,
        location: eventData.location,
        clubName: eventData.clubName,
      });

      return eventData;
    }).filter((event): event is SheetEvent => event !== null);

    // Find the specific event by ID
    const event = events.find(e => e.id === id);
    
    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Found event:', event.title);

    return new Response(
      JSON.stringify({ success: true, event }),
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error fetching event:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch event details' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
