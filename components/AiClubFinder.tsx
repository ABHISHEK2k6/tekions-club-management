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
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Calendar, Star, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface ClubSuggestion {
  clubName: string;
  clubId: string;
  reason: string;
  matchScore: number;
}

interface ClubDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  _count: {
    members: number;
    events: number;
  };
  owner: {
    name: string;
  };
}

export default function AiClubFinder() {
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ClubSuggestion | null>(null);
  const [clubDetails, setClubDetails] = useState<ClubDetails | null>(null);
  const [error, setError] = useState('');

  const handleGenerateSuggestion = async () => {
    if (!interest.trim()) return;
    
    setLoading(true);
    setSuggestion(null);
    setClubDetails(null);
    setError('');
    
    try {
      // Get AI suggestion from database-driven API
      const response = await fetch('/api/clubs/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interest: interest.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get club suggestion');
      }

      const result = await response.json();
      setSuggestion(result);

      // Fetch detailed club information
      if (result.clubId) {
        const clubResponse = await fetch(`/api/clubs/${result.clubId}`);
        if (clubResponse.ok) {
          const club = await clubResponse.json();
          setClubDetails(club);
        }
      }
    } catch (e) {
      console.error('Error suggesting club:', e);
      setError('Sorry, I had trouble finding a club for you. Please try a different interest or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mb-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>AI Club Finder</CardTitle>
            <CardDescription>
              Tell us your interests, and our AI will analyze all clubs in our database to find your perfect match based on descriptions, categories, tags, and activities!
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
              placeholder="e.g., 'web development', 'photography', 'environmental activism', 'coding'"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuggestion()}
              className="flex-1"
            />
            <Button onClick={handleGenerateSuggestion} disabled={loading || !interest.trim()}>
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Find Club'}
            </Button>
          </div>

          {loading && (
             <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && !loading && (
            <div className="pt-4">
                <Card className="bg-red-50 border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </Card>
            </div>
          )}

          {suggestion && !loading && (
            <div className="pt-4">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                Perfect Match: <span className="text-blue-600">{suggestion.clubName}</span>
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    {suggestion.matchScore}/10 Match
                                </Badge>
                                {clubDetails && (
                                    <Badge variant="outline">{clubDetails.category}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{suggestion.reason}</p>
                    
                    {clubDetails && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border">
                                <p className="text-sm text-gray-600 mb-3">{clubDetails.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span>{clubDetails._count.members} members</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>{clubDetails._count.events} upcoming events</span>
                                    </div>
                                </div>
                                
                                {clubDetails.tags && clubDetails.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {clubDetails.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                
                                <p className="text-xs text-gray-500">
                                    Led by {clubDetails.owner.name}
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                <Link href={`/clubs/${clubDetails.id}`} className="flex-1">
                                    <Button className="w-full">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Club Details
                                    </Button>
                                </Link>
                                <Link href="/clubs">
                                    <Button variant="outline">
                                        Browse All Clubs
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {!clubDetails && (
                        <div className="mt-4 flex justify-end">
                            <Link href="/clubs">
                                <Button>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View All Clubs
                                </Button>
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
