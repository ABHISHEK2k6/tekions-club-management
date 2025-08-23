'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Star,
  MapPin,
  Clock,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const { data: session, status } = useSession();

  // Set page title
  useEffect(() => {
    document.title = 'Dashboard - Tekions Club Management Portal';
  }, []);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Mock data - replace with real data from API
  const userStats = {
    joinedClubs: 3,
    upcomingEvents: 5,
    points: 150,
    rank: 12
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Talk: AI in Education",
      club: "Computer Science Club",
      date: "2025-08-25",
      time: "14:00",
      venue: "Auditorium A",
      attendees: 45
    },
    {
      id: 2,
      title: "Cultural Night Planning",
      club: "Cultural Society",
      date: "2025-08-26",
      time: "16:30",
      venue: "Room 201",
      attendees: 12
    },
    {
      id: 3,
      title: "Photography Workshop",
      club: "Photography Club",
      date: "2025-08-28",
      time: "10:00",
      venue: "Studio B",
      attendees: 20
    }
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: "Annual Sports Day Registration Open",
      club: "Sports Committee",
      priority: "high",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "New Workshop on Web Development",
      club: "Tech Club",
      priority: "normal",
      time: "5 hours ago"
    },
    {
      id: 3,
      title: "Cultural Week Planning Meeting",
      club: "Cultural Society",
      priority: "normal",
      time: "1 day ago"
    }
  ];

  const myClubs = [
    {
      id: 1,
      name: "Computer Science Club",
      role: "Member",
      members: 120,
      category: "Academic"
    },
    {
      id: 2,
      name: "Photography Club",
      role: "Admin",
      members: 45,
      category: "Creative"
    },
    {
      id: 3,
      name: "Debate Society",
      role: "Member",
      members: 80,
      category: "Academic"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your clubs today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined Clubs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.joinedClubs}</div>
              <p className="text-xs text-muted-foreground">Active memberships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.points}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userStats.rank}</div>
              <p className="text-xs text-muted-foreground">Campus ranking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Events you're registered for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.club}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.date} at {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
                <div className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/events">View All Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-sm">{announcement.title}</h5>
                    <p className="text-xs text-gray-600">{announcement.club}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge 
                        variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{announcement.time}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href="/announcements">View All</Link>
                </Button>
              </CardContent>
            </Card>

            {/* My Clubs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Clubs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-sm">{club.name}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {club.role}
                        </Badge>
                        <span>{club.members} members</span>
                        <span>• {club.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href="/clubs">Browse Clubs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
