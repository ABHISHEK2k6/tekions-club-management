'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Plus,
  ExternalLink,
  Heart,
  Share
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  isRegistered: boolean;
  isFavorite: boolean;
  category: string;
  club: {
    id: string;
    name: string;
    logo?: string;
  };
  image?: string;
}

const EventsPage = () => {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, upcoming, registered, past

  const categories = ['all', 'Technology', 'Cultural', 'Sports', 'Academic', 'Social', 'Workshop'];

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Tech Talk: Introduction to AI',
            description: 'Join us for an exciting introduction to artificial intelligence and machine learning concepts.',
            date: '2025-08-25T14:00:00Z',
            endDate: '2025-08-25T16:00:00Z',
            location: 'Auditorium A',
            maxParticipants: 100,
            currentParticipants: 45,
            isRegistered: true,
            isFavorite: false,
            category: 'Technology',
            club: {
              id: '1',
              name: 'Computer Science Club'
            }
          },
          {
            id: '2',
            title: 'Cultural Festival Planning',
            description: 'Planning meeting for the upcoming cultural festival. All cultural society members are invited.',
            date: '2025-08-26T16:30:00Z',
            location: 'Room 201',
            currentParticipants: 15,
            isRegistered: false,
            isFavorite: true,
            category: 'Cultural',
            club: {
              id: '2',
              name: 'Cultural Society'
            }
          },
          {
            id: '3',
            title: 'Photography Workshop',
            description: 'Learn advanced photography techniques from professional photographers.',
            date: '2025-08-27T10:00:00Z',
            endDate: '2025-08-27T15:00:00Z',
            location: 'Art Studio',
            maxParticipants: 25,
            currentParticipants: 18,
            isRegistered: false,
            isFavorite: false,
            category: 'Workshop',
            club: {
              id: '3',
              name: 'Photography Club'
            }
          },
          {
            id: '4',
            title: 'Basketball Tournament',
            description: 'Annual inter-college basketball tournament. Register your team now!',
            date: '2025-08-30T09:00:00Z',
            endDate: '2025-08-30T18:00:00Z',
            location: 'Sports Complex',
            maxParticipants: 80,
            currentParticipants: 32,
            isRegistered: true,
            isFavorite: true,
            category: 'Sports',
            club: {
              id: '4',
              name: 'Sports Committee'
            }
          },
          {
            id: '5',
            title: 'Web Development Bootcamp',
            description: 'Intensive 3-day bootcamp covering modern web development technologies.',
            date: '2025-09-01T09:00:00Z',
            endDate: '2025-09-03T17:00:00Z',
            location: 'Computer Lab',
            maxParticipants: 30,
            currentParticipants: 22,
            isRegistered: false,
            isFavorite: false,
            category: 'Technology',
            club: {
              id: '1',
              name: 'Computer Science Club'
            }
          }
        ];

        setEvents(mockEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadEvents();
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.club.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'upcoming':
        matchesFilter = eventDate > now;
        break;
      case 'registered':
        matchesFilter = event.isRegistered;
        break;
      case 'past':
        matchesFilter = eventDate < now;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : eventDate;

    if (now < eventDate) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= eventDate && now <= endDate) {
      return { status: 'ongoing', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'past', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const toggleFavorite = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, isFavorite: !event.isFavorite } : event
    ));
  };

  const toggleRegistration = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, isRegistered: !event.isRegistered } : event
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">
            Discover exciting events and activities happening around campus.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by name, description, or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="registered">My Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} events
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={eventStatus.color}>
                            {eventStatus.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{event.club.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(event.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`h-4 w-4 ${event.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.currentParticipants}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant={event.isRegistered ? "secondary" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleRegistration(event.id)}
                        disabled={event.maxParticipants && event.currentParticipants >= event.maxParticipants && !event.isRegistered}
                      >
                        {event.isRegistered ? 'Registered' : 'Register'}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find events that match your interests.
            </p>
            <Button asChild>
              <Link href="/clubs">Browse Clubs</Link>
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <Card className="bg-muted border-border">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Want to organize an event?
              </h3>
              <p className="text-muted-foreground mb-4">
                Join a club and start organizing amazing events for your community.
              </p>
              <Button asChild>
                <Link href="/clubs">
                  <Plus className="h-4 w-4 mr-2" />
                  Join a Club
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
