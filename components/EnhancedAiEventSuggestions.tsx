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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wand2, Calendar, Users, MapPin, Clock, Star, 
  Target, TrendingUp, Lightbulb, Sparkles 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { enhancedEventSuggestionService } from '@/lib/enhanced-ai-service';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface EventSuggestion {
  id: string;
  title: string;
  description: string;
  suggestedDate: string;
  estimatedDuration: string;
  venue: string;
  expectedParticipants: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  tags: string[];
  materials: string[];
  budget: {
    min: number;
    max: number;
  };
  successTips: string[];
  relatedSkills: string[];
  aiReasoning: string;
  matchScore: number;
}

interface ClubInfo {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  recentEvents: string[];
}

export default function EnhancedAiEventSuggestions() {
  const { data: session } = useSession();
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [userClubs, setUserClubs] = useState<ClubInfo[]>([]);
  const [eventType, setEventType] = useState('');
  const [customGoals, setCustomGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [error, setError] = useState('');
  const [loadingClubs, setLoadingClubs] = useState(true);

  const eventTypes = [
    'Workshop', 'Competition', 'Social Event', 'Learning Session',
    'Networking', 'Community Service', 'Cultural Event', 'Sports Activity',
    'Tech Meetup', 'Creative Session', 'Team Building', 'Guest Speaker'
  ];

  // Load user's clubs
  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/user/${session.user.id}/clubs`);
        if (response.ok) {
          const clubs = await response.json();
          setUserClubs(clubs);
          if (clubs.length > 0) {
            setSelectedClub(clubs[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching user clubs:', error);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchUserClubs();
  }, [session]);

  const handleGenerateEventSuggestions = async () => {
    if (!selectedClub || !eventType) return;
    
    setLoading(true);
    setSuggestions([]);
    setError('');
    
    try {
      const selectedClubInfo = userClubs.find(club => club.id === selectedClub);
      
      const result = await enhancedEventSuggestionService({
        clubId: selectedClub,
        clubInfo: selectedClubInfo,
        eventType,
        customGoals: customGoals.trim(),
        userId: session?.user?.id
      });
      
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setError('No event suggestions found. Try a different event type or add more specific goals.');
      }
    } catch (e) {
      console.error('Error generating event suggestions:', e);
      setError('Something went wrong while generating suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loadingClubs) {
    return (
      <Card className="shadow-lg w-full mb-12">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (userClubs.length === 0) {
    return (
      <Card className="shadow-lg w-full mb-12">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Event Suggestions
              </CardTitle>
              <CardDescription>
                Join a club first to get personalized event suggestions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clubs Joined Yet</h3>
            <p className="text-gray-600 mb-6">
              Join a club to unlock AI-powered event suggestions tailored to your community
            </p>
            <Link href="/clubs">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                Explore Clubs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mb-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <Wand2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Event Innovation Lab
            </CardTitle>
            <CardDescription className="text-base">
              Generate cutting-edge event ideas tailored to your club's DNA and member interests
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Club Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Select Your Club
          </label>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a club..." />
            </SelectTrigger>
            <SelectContent>
              {userClubs.map(club => (
                <SelectItem key={club.id} value={club.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{club.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {club.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ({club.memberCount} members)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Event Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {eventTypes.map(type => (
              <Button
                key={type}
                variant={eventType === type ? "default" : "outline"}
                size="sm"
                className={`justify-start ${
                  eventType === type 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'hover:bg-purple-50 hover:border-purple-300'
                }`}
                onClick={() => setEventType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Goals */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Specific Goals or Themes (optional)
          </label>
          <Textarea
            value={customGoals}
            onChange={(e) => setCustomGoals(e.target.value)}
            placeholder="e.g., 'increase member engagement', 'showcase new technologies', 'build team collaboration', 'celebrate cultural diversity'"
            disabled={loading}
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateEventSuggestions} 
          disabled={loading || !selectedClub || !eventType}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg py-6"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate AI Event Suggestions
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 pt-4">
            <div className="text-center text-sm text-gray-500 mb-4">
              🚀 AI is crafting innovative event ideas for your club...
            </div>
            {[1, 2].map(i => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
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
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">
                {suggestions.length} Innovative Event Idea{suggestions.length > 1 ? 's' : ''} for Your Club
              </h3>
            </div>
            
            {suggestions.map((event, index) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                          <TrendingUp className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">
                            {Math.round(event.matchScore)}% match
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(event.difficulty)}>
                      {event.difficulty}
                    </Badge>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-l-purple-400">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-800 mb-1">AI Insight:</p>
                        <p className="text-sm text-purple-700">{event.aiReasoning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Duration</p>
                        <p className="text-gray-600">{event.estimatedDuration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Expected</p>
                        <p className="text-gray-600">{event.expectedParticipants} people</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">Venue</p>
                        <p className="text-gray-600">{event.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">Budget</p>
                        <p className="text-gray-600">${event.budget.min}-${event.budget.max}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags and Skills */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills Developed</p>
                      <div className="flex flex-wrap gap-1">
                        {event.relatedSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Materials */}
                  {event.materials.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Materials</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {event.materials.map((material, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Success Tips */}
                  {event.successTips.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Success Tips</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {event.successTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full mt-2" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Suggested for {userClubs.find(c => c.id === selectedClub)?.name}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Customize
                      </Button>
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        Create Event
                      </Button>
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
