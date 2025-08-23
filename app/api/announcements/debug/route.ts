export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetId = searchParams.get('sheetId') || '2PACX-1vT4OJRnOG9AsE9WcYKRUHmONq-sLDC1hY3CEkDXAq9lZsPSchaW4sDWE-leuu0IVTzb5AOI0w9UuROs';
  const gid = searchParams.get('gid') || '252282664'; // Default to announcements sheet

  const testUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?gid=${gid}&single=true&output=csv`;

  try {
    console.log('🧪 Testing announcements sheet URL:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.replace(/"/g, '').trim()) || [];

    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        url: testUrl,
        responseLength: csvText.length,
        headers: headers,
        sampleData: {
          totalLines: lines.length,
          firstLine: lines[0]?.substring(0, 200),
          secondLine: lines[1]?.substring(0, 200),
          lastLine: lines[lines.length - 1]?.substring(0, 200),
        },
        availableColumns: headers,
        rawResponse: csvText.substring(0, 1000), // First 1000 chars for debugging
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: response.ok ? 200 : response.status
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: testUrl,
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
