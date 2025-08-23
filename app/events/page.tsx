'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock,
  MapPin,
  Users,
  Heart,
  UserCheck,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const EventsPage = () => {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Mock data - replace with real data from API
  const events = [
    {
      id: 1,
      title: "Tech Talk: AI in Education",
      description: "Join us for an insightful discussion about how AI is revolutionizing education and learning.",
      club: "Computer Science Club",
      clubId: 1,
      date: "2025-08-25T14:00:00Z",
      venue: "Auditorium A",
      maxParticipants: 100,
      currentParticipants: 45,
      category: "Academic",
      isRegistered: true,
      tags: ["AI", "Education", "Technology"],
      status: "upcoming"
    },
    {
      id: 2,
      title: "Cultural Night Planning Meeting",
      description: "Planning session for our upcoming cultural night celebration. All committee members welcome.",
      club: "Cultural Society",
      clubId: 5,
      date: "2025-08-26T16:30:00Z",
      venue: "Room 201",
      maxParticipants: 20,
      currentParticipants: 12,
      category: "Cultural",
      isRegistered: true,
      tags: ["Planning", "Culture", "Event"],
      status: "upcoming"
    },
    {
      id: 3,
      title: "Photography Workshop: Portrait Basics",
      description: "Learn the fundamentals of portrait photography with hands-on practice and expert guidance.",
      club: "Photography Club",
      clubId: 2,
      date: "2025-08-28T10:00:00Z",
      venue: "Studio B",
      maxParticipants: 15,
      currentParticipants: 20,
      category: "Creative",
      isRegistered: false,
      tags: ["Photography", "Workshop", "Portrait"],
      status: "upcoming"
    },
    {
      id: 4,
      title: "Debate Competition: Climate Change",
      description: "Inter-club debate competition discussing climate change policies and environmental action.",
      club: "Debate Society",
      clubId: 3,
      date: "2025-08-30T15:00:00Z",
      venue: "Main Hall",
      maxParticipants: 50,
      currentParticipants: 35,
      category: "Academic",
      isRegistered: false,
      tags: ["Debate", "Environment", "Competition"],
      status: "upcoming"
    },
    {
      id: 5,
      title: "Basketball Tournament Finals",
      description: "Championship game of our annual basketball tournament. Come cheer for your favorite team!",
      club: "Sports Committee",
      clubId: 6,
      date: "2025-09-01T18:00:00Z",
      venue: "Sports Complex",
      maxParticipants: 200,
      currentParticipants: 156,
      category: "Sports",
      isRegistered: true,
      tags: ["Basketball", "Tournament", "Finals"],
      status: "upcoming"
    },
    {
      id: 6,
      title: "Coding Bootcamp Day 1",
      description: "Intensive 3-day coding bootcamp covering full-stack web development fundamentals.",
      club: "Computer Science Club",
      clubId: 1,
      date: "2025-08-20T09:00:00Z",
      venue: "Computer Lab",
      maxParticipants: 30,
      currentParticipants: 30,
      category: "Academic",
      isRegistered: true,
      tags: ["Coding", "Web Development", "Bootcamp"],
      status: "past"
    }
  ];

  const categories = ["all", "Academic", "Creative", "Cultural", "Sports", "Social Impact"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'registered' && event.isRegistered) ||
                      (activeTab === 'upcoming' && event.status === 'upcoming') ||
                      (activeTab === 'past' && event.status === 'past');
    return matchesSearch && matchesCategory && matchesTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailabilityStatus = (current: number, max: number | null) => {
    if (!max) return 'open';
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'full';
    if (percentage >= 80) return 'limited';
    return 'open';
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'full': return 'destructive';
      case 'limited': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and register for exciting events happening across campus.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events by title, description, or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="registered">My Registrations</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredEvents.length} events
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => {
                const availabilityStatus = getAvailabilityStatus(event.currentParticipants, event.maxParticipants);
                
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                            </Badge>
                            <Badge 
                              variant={getAvailabilityColor(availabilityStatus)}
                              className="text-xs"
                            >
                              {availabilityStatus === 'full' ? 'Full' : 
                               availabilityStatus === 'limited' ? 'Limited Spots' : 
                               'Available'}
                            </Badge>
                            {event.status === 'past' && (
                              <Badge variant="secondary" className="text-xs">
                                Past Event
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                          <CardDescription className="text-sm text-blue-600 font-medium">
                            {event.club}
                          </CardDescription>
                        </div>
                        {event.status !== 'past' && (
                          <Button
                            variant={event.isRegistered ? "outline" : "default"}
                            size="sm"
                            disabled={availabilityStatus === 'full' && !event.isRegistered}
                            className="ml-4"
                          >
                            {event.isRegistered ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Registered
                              </>
                            ) : availabilityStatus === 'full' ? (
                              'Full'
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Register
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>
                            {event.currentParticipants} registered
                            {event.maxParticipants && ` / ${event.maxParticipants} max`}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/events/${event.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/clubs/${event.clubId}`}>
                            View Club
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No results */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find events that interest you.
                </p>
                <Button asChild>
                  <Link href="/clubs">Browse Clubs</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsPage;
