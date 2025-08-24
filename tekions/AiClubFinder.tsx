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
import { Sparkles } from 'lucide-react';
import { suggestClub } from '@/ai/flows/suggestClub';
import { Skeleton } from '../ui/skeleton';
import { allClubs } from '@/lib/mock-data';
import Link from 'next/link';

export default function AiClubFinder() {
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ clubName: string; reason: string } | null>(null);
  const [error, setError] = useState('');

  const handleGenerateSuggestion = async () => {
    if (!interest) return;
    setLoading(true);
    setSuggestion(null);
    setError('');
    try {
      const result = await suggestClub({ interest });
      setSuggestion(result);
    } catch (e) {
      console.error('Error suggesting club:', e);
      setError('Sorry, I had trouble finding a club for you. Please try a different interest.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedClub = suggestion ? allClubs.find(c => c.name === suggestion.clubName) : null;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mb-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <CardTitle>AI Club Finder</CardTitle>
            <CardDescription>
              Tell us your interests, and we'll suggest a club for you!
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g., 'painting', 'video games', 'hiking'"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuggestion()}
            />
            <Button onClick={handleGenerateSuggestion} disabled={loading || !interest}>
              <Sparkles className="mr-2 h-4 w-4" />
              Find Club
            </Button>
          </div>

          {loading && (
             <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {error && !loading && (
            <div className="pt-4">
                <Card className="bg-destructive/10 border-destructive/50 p-4">
                    <p className="text-sm text-destructive-foreground">{error}</p>
                </Card>
            </div>
          )}

          {suggestion && !loading && (
            <div className="pt-4">
                <Card className="bg-muted/50 p-4">
                    <p className="font-semibold text-foreground">We think you'd like the <span className="text-primary">{suggestion.clubName}</span>!</p>
                    <p className="text-sm text-muted-foreground mt-2">{suggestion.reason}</p>
                    {suggestedClub && (
                        <div className="mt-4 flex justify-end">
                            <Link href="/clubs">
                                <Button>View Club</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
