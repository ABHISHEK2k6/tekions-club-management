import Papa from 'papaparse';

export async function GET() {
  try {
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSA1xDNm7Ddy0LZdhksZjMh_VhLc-e8kCM1y10HjXRpUxEzf6c8dSwHfR-fvPVvkODcHEKW1-Sb6-Xl/pub?output=csv&gid=0";
    
    const response = await fetch(SHEET_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
    }

    const announcements = parsed.data.map((row: any) => ({
      id: row.id || '',
      title: row.title || '',
      content: row.content || '',
      club: row.club || '',
      author: row.author || '',
      date: row.date || '',
      priority: row.priority || '',
      tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
    }));

    // Test filtering logic
    const priorities = ["all", "urgent", "high", "normal", "medium", "low"];
    const testResults: any = {};
    
    priorities.forEach(selectedPriority => {
      const filtered = announcements.filter(announcement => {
        const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
        return matchesPriority; // Just test priority filtering
      });
      
      testResults[selectedPriority] = {
        count: filtered.length,
        items: filtered.map(a => ({ id: a.id, priority: a.priority, title: a.title }))
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalAnnouncements: announcements.length,
        allPriorities: [...new Set(announcements.map(a => a.priority))],
        testResults,
        rawData: announcements.map(a => ({ id: a.id, priority: a.priority, title: a.title }))
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error testing filter:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
