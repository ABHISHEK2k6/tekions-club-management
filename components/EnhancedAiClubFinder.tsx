'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Users, Calendar, MapPin, Star, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { enhancedSuggestClubService } from '@/lib/enhanced-ai-service';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ClubSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  tags: string[];
  memberCount: number;
  upcomingEvents: number;
  owner: {
    name: string;
    image?: string;
  };
  matchScore: number;
  reason: string;
  meetingSchedule?: string;
  isPublic: boolean;
}

export default function EnhancedAiClubFinder() {
  const { data: session } = useSession();
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ClubSuggestion[]>([]);
  const [error, setError] = useState('');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  const categories = [
    'Technology', 'Arts', 'Sports', 'Music', 'Academic', 
    'Social', 'Environment', 'Business', 'Gaming', 'Cultural'
  ];

  const handleGenerateSuggestion = async () => {
    if (!interest.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setError('');
    
    try {
      const result = await enhancedSuggestClubService({
        interest: interest.trim(),
        preferredCategories,
        userId: session?.user?.id
      });
      
      if (result.clubs && result.clubs.length > 0) {
        setSuggestions(result.clubs);
      } else {
        setError('No matching clubs found. Try adjusting your interests or explore different categories.');
      }
    } catch (e) {
      console.error('Error suggesting clubs:', e);
      setError('Something went wrong while finding clubs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferredCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mb-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Club Discovery
            </CardTitle>
            <CardDescription className="text-base">
              Discover clubs that perfectly match your interests and goals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Interest Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What are you passionate about?
          </label>
          <div className="flex gap-2">
            <Input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g., 'machine learning and AI', 'digital photography', 'sustainable technology'"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuggestion()}
              className="flex-1"
            />
            <Button 
              onClick={handleGenerateSuggestion} 
              disabled={loading || !interest.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Find Clubs
            </Button>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Preferred Categories (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={preferredCategories.includes(category) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  preferredCategories.includes(category) 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'hover:bg-blue-50 hover:border-blue-300'
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 pt-4">
            <div className="text-center text-sm text-gray-500 mb-4">
              🔍 Analyzing your interests and finding the perfect clubs...
            </div>
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-50 border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">
                Found {suggestions.length} perfect match{suggestions.length > 1 ? 'es' : ''} for you!
              </h3>
            </div>
            
            {suggestions.map((club, index) => (
              <Card key={club.id} className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={club.logo} alt={club.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {club.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{club.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <Heart className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          {Math.round(club.matchScore)}% match
                        </span>
                      </div>
                    </div>

                    {/* AI Reason */}
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-400">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Why this club:</span> {club.reason}
                      </p>
                    </div>

                    {/* Club Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {club.memberCount} members
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {club.upcomingEvents} upcoming events
                      </div>
                      {club.meetingSchedule && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {club.meetingSchedule}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {club.category}
                      </Badge>
                      {club.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={club.owner.image} />
                          <AvatarFallback className="text-xs">
                            {club.owner.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        Led by {club.owner.name}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/clubs/${club.id}`}>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </Link>
                        <Link href={`/clubs/${club.id}`}>
                          <Button size="sm">
                            Join Club
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
