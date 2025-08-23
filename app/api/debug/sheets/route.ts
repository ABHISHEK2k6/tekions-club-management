// Debug API route to test different Google Sheets URLs

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sheetId = url.searchParams.get('sheetId') || '1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI';
  const gid = url.searchParams.get('gid') || '0';
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
  try {
    console.log('Testing URL:', csvUrl);
    
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const result: {
      url: string;
      status: number;
      statusText: string;
      headers: { [k: string]: string };
      ok: boolean;
      dataPreview?: string;
      lineCount?: number;
      errorText?: string;
    } = {
      url: csvUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok,
    };
    
    if (response.ok) {
      const text = await response.text();
      result.dataPreview = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      result.lineCount = text.split('\n').length;
    } else {
      const errorText = await response.text();
      result.errorText = errorText;
    }
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      url: csvUrl,
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
