// Comprehensive Google Sheets access troubleshooting
import Papa from 'papaparse';

const SHEET_ID = '1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI';

// Multiple URL formats and approaches
const testConfigs = [
  {
    name: 'Published web CSV (standard format)',
    url: `https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/pub?output=csv`,
  },
  {
    name: 'Published web CSV with gid=0',
    url: `https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/pub?gid=0&single=true&output=csv`,
  },
  {
    name: 'Published web CSV with gid=0 (alternative)',
    url: `https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/pub?output=csv&gid=0`,
  },
  {
    name: 'Standard CSV export (gid=0)',
    url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  },
  {
    name: 'CSV export without gid',
    url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  },
  {
    name: 'Google Visualization API',
    url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`,
  },
];

async function testSheetAccess(config: typeof testConfigs[0]) {
  try {
    console.log(`🧪 Testing: ${config.name}`);
    console.log(`📍 URL: ${config.url}`);
    
    const response = await fetch(config.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/csv,application/csv,text/plain,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });
    
    const responseText = await response.text();
    
    const result = {
      name: config.name,
      url: config.url,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      contentLength: responseText.length,
      contentType: response.headers.get('content-type'),
      preview: responseText.substring(0, 200),
      headers: {} as any,
      sampleData: [] as any[],
      parseErrors: [] as any[],
    };
    
    // If successful, try to parse
    if (response.ok && responseText.length > 0) {
      try {
        const parseResult = Papa.parse(responseText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
        });
        
        result.headers = Object.keys(parseResult.data[0] || {});
        result.sampleData = parseResult.data.slice(0, 2);
        result.parseErrors = parseResult.errors;
      } catch (parseError) {
        result.parseErrors = [{ message: parseError.message }];
      }
    }
    
    return result;
    
  } catch (error) {
    return {
      name: config.name,
      url: config.url,
      success: false,
      error: error.message,
    };
  }
}

export async function GET() {
  try {
    console.log('🔍 Starting comprehensive Google Sheets access test...');
    
    // Test all configurations
    const results = await Promise.allSettled(
      testConfigs.map(config => testSheetAccess(config))
    );
    
    // Process results
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: testConfigs[index].name,
          url: testConfigs[index].url,
          success: false,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
    
    // Find successful results
    const successfulResults = processedResults.filter(r => r.success);
    const workingUrl = successfulResults[0]?.url || null;
    
    // Generate recommendations
    let recommendations = [];
    
    if (successfulResults.length === 0) {
      recommendations = [
        "❌ No URLs worked. The sheet may not be properly shared.",
        "🔧 Try these steps:",
        "1. Open your Google Sheet",
        "2. Click 'Share' button (top right)",
        "3. Change to 'Anyone with the link can VIEW'",
        "4. Make sure it's NOT restricted to your organization",
        "5. Try publishing: File → Share → Publish to web → CSV",
        "6. If using work/school account, the organization may block public sharing"
      ];
    } else {
      recommendations = [
        `✅ Found ${successfulResults.length} working URL(s)!`,
        `🎯 Best URL: ${workingUrl}`,
        "✨ Your sheet data should now be accessible!"
      ];
    }
    
    return new Response(JSON.stringify({
      success: successfulResults.length > 0,
      message: successfulResults.length > 0 ? 'Sheet access successful!' : 'All access methods failed',
      workingUrl,
      successfulCount: successfulResults.length,
      totalTested: testConfigs.length,
      recommendations,
      detailedResults: processedResults,
      nextSteps: successfulResults.length > 0 ? 
        'Update your main API to use the working URL format' : 
        'Fix sheet sharing settings and try again'
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Debug test encountered an error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
