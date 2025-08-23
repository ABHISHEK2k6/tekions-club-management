'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestSheetUrl() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testUrl = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/debug/test-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to test URL: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Sheets URL Tester</h1>
        <p className="text-muted-foreground">
          Paste your published Google Sheets URL to test if it works for CSV access.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Your Published URL</CardTitle>
          <CardDescription>
            Enter the published URL you got from "File → Share → Publish to web"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testUrl} disabled={loading}>
              {loading ? 'Testing...' : 'Test URL'}
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Expected format:</strong> The URL should start with{' '}
              <code>https://docs.google.com/spreadsheets/d/e/2PACX-1v...</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
              Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  <strong>{result.message}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {result.status} {result.statusText}
                </div>
                <div>
                  <strong>Content Type:</strong> {result.contentType || 'N/A'}
                </div>
                {result.totalRows !== undefined && (
                  <div>
                    <strong>Total Rows:</strong> {result.totalRows}
                  </div>
                )}
                {result.headers && result.headers.length > 0 && (
                  <div className="md:col-span-2">
                    <strong>Headers:</strong> {result.headers.join(', ')}
                  </div>
                )}
              </div>

              {result.csvPreview && (
                <div>
                  <strong>CSV Preview:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    {result.csvPreview}
                  </pre>
                </div>
              )}

              {result.sampleData && result.sampleData.length > 0 && (
                <div>
                  <strong>Sample Data:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(result.sampleData, null, 2)}
                  </pre>
                </div>
              )}

              {result.success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription>
                    🎉 <strong>Great!</strong> This URL works perfectly. We can update your app to use this URL.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
