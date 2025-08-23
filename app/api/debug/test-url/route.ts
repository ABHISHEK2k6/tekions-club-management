// Test any Google Sheets URL
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please provide a URL to test'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('🧪 Testing user-provided URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/csv,application/csv,text/plain,*/*',
      },
    });
    
    const result = {
      url,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      contentType: response.headers.get('content-type'),
      message: '',
      headers: [] as string[],
      sampleData: [] as any[],
      totalRows: 0,
      csvPreview: '',
    };
    
    if (!response.ok) {
      result.message = `Failed: HTTP ${response.status} ${response.statusText}`;
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const csvText = await response.text();
    result.csvPreview = csvText.substring(0, 300);
    
    if (csvText.length === 0) {
      result.message = 'Success but empty response - check if sheet has data';
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Parse with PapaParse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });
    
    result.headers = Object.keys(parseResult.data[0] || {});
    result.sampleData = parseResult.data.slice(0, 3);
    result.totalRows = parseResult.data.length;
    result.success = true;
    result.message = `✅ Success! Found ${result.totalRows} rows with headers: ${result.headers.join(', ')}`;
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ URL test failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Test failed with error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
