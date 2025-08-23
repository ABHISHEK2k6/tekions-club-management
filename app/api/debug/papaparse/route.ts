// Debug API endpoint to test multiple Google Sheets access methods
import Papa from 'papaparse';

const SHEET_ID = '1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI';

// Try multiple URL formats
const URLs = [
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&usp=sharing`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`,
];

async function testURL(url: string, index: number) {
  try {
    console.log(`🧪 Testing URL ${index + 1}:`, url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    if (!response.ok) {
      return {
        url,
        success: false,
        status,
        statusText,
        error: `HTTP ${status}: ${statusText}`
      };
    }
    
    const csvText = await response.text();
    
    // Try to parse with PapaParse
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });
    
    return {
      url,
      success: true,
      status,
      statusText,
      csvLength: csvText.length,
      headers: Object.keys(parseResult.data[0] || {}),
      totalRows: parseResult.data.length,
      sampleData: parseResult.data.slice(0, 2),
      errors: parseResult.errors,
      csvPreview: csvText.substring(0, 200)
    };
    
  } catch (error) {
    return {
      url,
      success: false,
      error: error.message
    };
  }
}

export async function GET() {
  try {
    console.log('🔍 Testing multiple Google Sheets access methods...');
    
    const results = await Promise.all(URLs.map(testURL));
    
    // Find the first successful result
    const successfulResult = results.find(r => r.success);
    
    return new Response(JSON.stringify({
      message: successfulResult ? 'Found working URL!' : 'All URLs failed',
      workingUrl: successfulResult?.url || null,
      allResults: results,
      recommendation: successfulResult ? 
        `Use this URL format: ${successfulResult.url}` : 
        'Sheet may not be properly shared or accessible'
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to test PapaParse'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
