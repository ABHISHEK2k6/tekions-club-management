'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/ui/loader';
import MiniLoader from '@/components/ui/mini-loader';
import PortalNavbar from '@/components/portal-navbar';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  joinedClubs: number;
  upcomingEvents: number;
  totalPoints: number;
  campusRank: number;
}

interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  _count: {
    members: number;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  category: string;
  clubName: string;
  clubId: string;
  image?: string;
  registrationLink?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  club: string;
  priority: 'urgent' | 'high' | 'normal' | 'medium' | 'low';
  author: string;
  date: string;
  tags: string[];
}

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const { events, loading: eventsLoading, error: eventsError, isDemo } = useEvents();
  const { clubs, loading: clubsLoading, error: clubsError, totalJoinedClubs } = useUserClubs();
  const { announcements: liveAnnouncements, loading: announcementsLoading } = useAnnouncements();
  const [stats, setStats] = useState<DashboardStats>({
    joinedClubs: 0, // Will be updated from real data
    upcomingEvents: 5,
    totalPoints: 150,
    campusRank: 12
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Update stats when real data loads
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      joinedClubs: totalJoinedClubs
    }));
  }, [totalJoinedClubs]);

  useEffect(() => {
    // Use real announcements data from the hook
    if (!announcementsLoading && liveAnnouncements) {
      // Map API data to dashboard format and sort by date (most recent first)
      const mappedAnnouncements: Announcement[] = liveAnnouncements
        .map(ann => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          club: ann.club,
          priority: ann.priority,
          author: ann.author,
          date: ann.createdAt, // Map createdAt to date
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <img
          src="/UI/dino-loader.gif"
          alt="Loading..."
          className="w-32 h-32 mb-4"
          style={{ imageRendering: 'pixelated' }}
        />
        <span className="text-gray-600">Loading dashboard...</span>
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
    <Loader>
      <div className="min-h-screen bg-background">
        <PortalNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Here's what's happening in your clubs today.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Joined Clubs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.joinedClubs}</div>
                <p className="text-xs text-muted-foreground">Active memberships</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Points
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                <p className="text-xs text-muted-foreground">Total earned</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leaderboard Rank
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{stats.campusRank}</div>
                <p className="text-xs text-muted-foreground">Campus ranking</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mini-heading text-lg">
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
                  <div className="flex justify-center items-center py-8">
                    <MiniLoader size="md" />
                    <span className="ml-3 text-gray-600">Loading events...</span>
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
                      
                      if (!isValidDate) {
                        console.log(`Skipping event with invalid date: "${event.title}" - "${event.date}"`);
                        return false;
                      }
                      
                      // Compare dates at day level (ignore time)
                      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                      return eventDay >= today;
                    });
                    
                    return upcomingEvents.length > 0 ? (
                      upcomingEvents.slice(0, 3).map((event, index) => (
                        <div key={`dashboard-${event.id}-${index}`} className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <h4 className=" text-sm mb-1">
                              {event.title}
                            </h4>
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
                  <CardTitle className="flex items-center gap-2 mini-heading text-lg">
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
                  <div className="flex justify-center items-center py-8">
                    <MiniLoader size="md" />
                    <span className="ml-3 text-gray-600">Loading announcements...</span>
                  </div>
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm">
                          {announcement.title}
                        </h4>
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
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 mini-heading text-lg">
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
                <div className="flex justify-center items-center py-8">
                  <MiniLoader size="md" />
                  <span className="ml-3 text-gray-600">Loading clubs...</span>
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
                            <CardTitle className="text-sm">
                              {club.name}
                            </CardTitle>
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
                  <h3 className="text-lg font-semibold mb-2">
                    No clubs joined yet
                  </h3>
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
    </Loader>
  );
};

export default DashboardPage;
