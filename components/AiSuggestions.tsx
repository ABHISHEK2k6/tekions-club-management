'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2 } from 'lucide-react';
import { generateSuggestion } from '@/lib/ai/flows/generateSuggestion';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiSuggestions() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleGenerateSuggestion = async () => {
    if (!topic) return;
    setLoading(true);
    setSuggestion('');
    try {
      const result = await generateSuggestion({ topic });
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestion('Sorry, I had trouble coming up with an idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Wand2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>AI-Powered Club Suggestions</CardTitle>
            <CardDescription>
              Get creative ideas for your club activities, events, and member engagement.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            What do you need ideas for? (e.g., "team building event", "fundraising activity", "member recruitment")
          </p>
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., engaging workshop ideas for new members"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuggestion()}
            />
            <Button onClick={handleGenerateSuggestion} disabled={loading || !topic}>
              <Wand2 className="mr-2 h-4 w-4" />
              Suggest
            </Button>
          </div>

          {loading && (
             <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {suggestion && !loading && (
            <div className="pt-4">
                <Card className="bg-purple-50 border-purple-200 p-4">
                    <p className="text-sm text-gray-800">{suggestion}</p>
                </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
