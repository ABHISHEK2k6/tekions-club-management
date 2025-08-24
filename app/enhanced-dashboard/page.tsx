'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalNavbar from '@/components/portal-navbar';
import EnhancedAiClubFinder from '@/components/EnhancedAiClubFinder';
import EnhancedAiEventSuggestions from '@/components/EnhancedAiEventSuggestions';
import { useEvents } from '@/hooks/use-events';
import { useUserClubs } from '@/hooks/use-user-clubs';
import { useAnnouncements } from '@/hooks/use-announcements';
import { 
  Users, 
  Calendar, 
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  Bell,
  Star,
  ArrowRight,
  Plus,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  joinedClubs: number;
  upcomingEvents: number;
  totalPoints: number;
  campusRank: number;
}

export default function EnhancedDashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    joinedClubs: 0,
    upcomingEvents: 0,
    totalPoints: 0,
    campusRank: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Hooks
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const { clubs, loading: clubsLoading, error: clubsError } = useUserClubs();
  const { announcements: liveAnnouncements, loading: announcementsLoading } = useAnnouncements();

  // Initialize stats from user clubs
  useEffect(() => {
    if (clubs.length > 0) {
      setStats(prev => ({
        ...prev,
        joinedClubs: clubs.length
      }));
    }
  }, [clubs]);

  // Process announcements
  useEffect(() => {
    if (liveAnnouncements && !announcementsLoading) {
      const mappedAnnouncements = liveAnnouncements
        .map((ann: any) => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          club: ann.club,
          priority: ann.priority,
          author: ann.author,
          date: ann.createdAt,
          tags: ann.tags
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAnnouncements(mappedAnnouncements);
      setLoading(false);
    }
  }, [liveAnnouncements, announcementsLoading]);

  // Update stats based on upcoming events
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const isValidDate = !isNaN(eventDate.getTime());
        
        if (!isValidDate) return false;
        
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay >= today;
      });
      
      setStats(prev => ({
        ...prev,
        upcomingEvents: upcomingEvents.length
      }));
    }
  }, [events]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/sign-in');
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover your perfect clubs and events with AI-powered suggestions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined Clubs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.joinedClubs}</div>
              <p className="text-xs text-muted-foreground">Active memberships</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.campusRank}</div>
              <p className="text-xs text-muted-foreground">Campus ranking</p>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Discovery
              </h2>
              <p className="text-muted-foreground">
                Let AI help you find the perfect clubs and events
              </p>
            </div>
          </div>

          <Tabs defaultValue="club-discovery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="club-discovery" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Club Discovery
              </TabsTrigger>
              <TabsTrigger value="event-ideas" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Event Ideas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="club-discovery" className="mt-6">
              <EnhancedAiClubFinder />
            </TabsContent>
            
            <TabsContent value="event-ideas" className="mt-6">
              <EnhancedAiEventSuggestions />
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Events you're registered for</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading || eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : eventsError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Error loading events: {eventsError}</p>
                </div>
              ) : events.length > 0 ? (
                (() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  
                  const upcomingEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    const isValidDate = !isNaN(eventDate.getTime());
                    
                    if (!isValidDate) return false;
                    
                    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                    return eventDay >= today;
                  });
                  
                  return upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground mb-1">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{event.clubName}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            {event.maxParticipants && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{event.currentParticipants}/{event.maxParticipants}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/events/${event.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Announcements
                  {!announcementsLoading && announcements.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {announcements.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Latest updates from your clubs</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/announcements">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcementsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{announcement.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{announcement.club}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(announcement.date)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent announcements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Clubs Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Clubs
              </CardTitle>
              <CardDescription>Clubs you've joined</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clubs">
                <Plus className="h-4 w-4 mr-2" />
                Browse Clubs
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {clubsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : clubsError ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-red-500">Error loading clubs: {clubsError}</p>
              </div>
            ) : clubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubs.map((club) => (
                  <Card key={club.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {club.logo ? (
                            <img src={club.logo} alt={club.name} className="w-8 h-8 rounded" />
                          ) : (
                            <Users className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{club.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{club._count.members} members</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {club.membershipRole}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {club.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {club.category}
                        </Badge>
                        {!club.isPublic && (
                          <Badge variant="outline" className="text-xs text-orange-600">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Joined {new Date(club.joinedAt).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/clubs/${club.id}`}>View Club</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No clubs joined yet</h3>
                <p className="text-muted-foreground mb-4">
                  Explore clubs and start connecting with like-minded students.
                </p>
                <Button asChild>
                  <Link href="/clubs">Browse Clubs</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
