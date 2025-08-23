'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalNavbar from '@/components/portal-navbar';
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
  Plus
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
  location: string;
  club: {
    name: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  club: {
    name: string;
  };
}

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    joinedClubs: 3,
    upcomingEvents: 5,
    totalPoints: 150,
    campusRank: 12
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API calls
        const mockClubs: Club[] = [
          {
            id: '1',
            name: 'Computer Science Club',
            description: 'Exploring the world of technology and programming',
            _count: { members: 45 }
          },
          {
            id: '2',
            name: 'Cultural Society',
            description: 'Celebrating diverse cultures and traditions',
            _count: { members: 67 }
          },
          {
            id: '3',
            name: 'Photography Club',
            description: 'Capturing moments and creating memories',
            _count: { members: 23 }
          }
        ];

        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Tech Talk: Introduction to AI',
            description: 'Learn about artificial intelligence basics',
            date: '2025-08-25T14:00:00Z',
            location: 'Auditorium A',
            club: { name: 'Computer Science Club' }
          },
          {
            id: '2',
            title: 'Cultural Festival Planning',
            description: 'Planning meeting for upcoming cultural festival',
            date: '2025-08-26T16:30:00Z',
            location: 'Room 201',
            club: { name: 'Cultural Society' }
          },
          {
            id: '3',
            title: 'Photography Workshop',
            description: 'Learn advanced photography techniques',
            date: '2025-08-27T10:00:00Z',
            location: 'Art Studio',
            club: { name: 'Photography Club' }
          }
        ];

        const mockAnnouncements: Announcement[] = [
          {
            id: '1',
            title: 'Annual Sports Day Registration Open',
            content: 'Register now for the annual sports day competition',
            priority: 'high',
            createdAt: '2025-08-24T10:00:00Z',
            club: { name: 'Sports Committee' }
          },
          {
            id: '2',
            title: 'New Workshop on Web Development',
            content: 'Join us for an exciting workshop on modern web development',
            priority: 'normal',
            createdAt: '2025-08-24T05:00:00Z',
            club: { name: 'Tech Club' }
          },
          {
            id: '3',
            title: 'Cultural Week Planning Meeting',
            content: 'Important meeting for cultural week planning',
            priority: 'normal',
            createdAt: '2025-08-23T00:00:00Z',
            club: { name: 'Cultural Society' }
          }
        ];

        setClubs(mockClubs);
        setEvents(mockEvents);
        setAnnouncements(mockAnnouncements);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadDashboardData();
    }
  }, [session]);

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
      case 'high': return 'bg-destructive text-destructive-foreground';
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
            Here's what's happening in your clubs today.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{event.club.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
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
                </CardTitle>
                <CardDescription>Latest updates from your clubs</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/announcements">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
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
                    <p className="text-xs text-muted-foreground mb-2">{announcement.club.name}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(announcement.createdAt)}</p>
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : clubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubs.map((club) => (
                  <Card key={club.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{club.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{club._count.members} members</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">{club.description}</p>
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
};

export default DashboardPage;
