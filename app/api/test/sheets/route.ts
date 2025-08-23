// Test API route with a known working public Google Sheet

const TEST_SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Google's example sheet
const TEST_CSV_URL = `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=0`;

export async function GET() {
  try {
    console.log('🧪 Testing with Google example sheet:', TEST_CSV_URL);
    
    const response = await fetch(TEST_CSV_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    console.log('✅ Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 CSV content preview:', csvText.substring(0, 200));
    
    return new Response(JSON.stringify({
      success: true,
      status: response.status,
      dataPreview: csvText.substring(0, 500),
      message: 'Google Sheets API is working! Your sheet might need permission settings adjusted.'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Even test sheet failed - network or API issue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
