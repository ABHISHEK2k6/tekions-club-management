import Papa from 'papaparse';

// Google Sheets configuration for announcements
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OJRnOG9AsE9WcYKRUHmONq-sLDC1hY3CEkDXAq9lZsPSchaW4sDWE-leuu0IVTzb5AOI0w9UuROs/pub?gid=252282664&single=true&output=csv';

interface CSVRow {
  [key: string]: string;
}

interface SheetAnnouncement {
  id: string;
  title: string;
  content: string;
  club: string;
  clubId: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  author: string;
  createdAt: string;
  tags: string[];
  isPublished: boolean;
}

export async function GET() {
  try {
    console.log('📊 Configured Google Sheets URL:', CSV_URL);
    console.log('📊 Fetching announcements from Google Sheets CSV...');
    console.log('🔗 URL:', CSV_URL);

    // Fetch CSV data from Google Sheets
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
      
      const errorText = await response.text();
      console.error('💬 Error response:', errorText);
      
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
        JSON.stringify({ announcements: [] }),
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

    const announcements: SheetAnnouncement[] = parseResult.data.map((row: CSVRow, index: number) => {
      // Check if this announcement is published
      const publishStatus = row['Publish Status']?.trim().toLowerCase() || '';
      const isPublished = publishStatus === 'published' || publishStatus === 'publish' || publishStatus === 'yes';
      
      if (!isPublished || !row['Title']?.trim()) {
        return null;
      }

      // Parse date
      const rawDate = row['Created Date']?.trim() || row['Date']?.trim() || '';
      let processedDate = rawDate;
      
      if (rawDate) {
        console.log(`📅 Processing date for announcement ${index + 1}: "${rawDate}"`);
        
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

      // Parse tags
      const tagsString = row['Tags']?.trim() || '';
      const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

      const announcementData: SheetAnnouncement = {
        id: row['Announcement ID']?.trim() || `announcement-${index}`,
        title: row['Title']?.trim() || '',
        content: row['Content']?.trim() || row['Description']?.trim() || '',
        club: row['Club']?.trim() || row['Organizer']?.trim() || 'General',
        clubId: (row['Club']?.trim() || 'general').toLowerCase().replace(/\s+/g, '-'),
        priority: (row['Priority']?.trim().toLowerCase() || 'normal') as 'urgent' | 'high' | 'normal' | 'low',
        author: row['Author']?.trim() || row['Created By']?.trim() || 'Admin',
        createdAt: processedDate || new Date().toISOString(),
        tags: tags,
        isPublished: isPublished,
      };

      console.log(`📝 Announcement ${index + 1}:`, {
        id: announcementData.id,
        title: announcementData.title,
        content: announcementData.content.substring(0, 100) + '...',
        club: announcementData.club,
        priority: announcementData.priority,
        author: announcementData.author,
      });

      return announcementData;
    }).filter((announcement): announcement is SheetAnnouncement => announcement !== null);

    console.log(`Parsed ${announcements.length} announcements from CSV`);

    return new Response(
      JSON.stringify({ 
        announcements,
        success: true,
        total: announcements.length 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch announcements', 
        details: error instanceof Error ? error.message : 'Unknown error',
        announcements: []
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
