'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PortalNavbar from '@/components/portal-navbar';
import { useEvents } from '@/hooks/use-events';
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
  category: string;
  clubName: string;
  clubId: string;
  image?: string;
  registrationLink?: string;
}

const EventsPage = () => {
  const { data: session, status } = useSession();
  const { events, loading, error, isDemo } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('upcoming'); // default to upcoming events

  // Extract unique categories from events
  const categories = ['all', ...Array.from(new Set(events.map(event => event.category).filter(Boolean)))];

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.clubName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'upcoming':
        matchesFilter = eventDate > now;
        break;
      case 'past':
        matchesFilter = eventDate < now;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

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

        {/* Demo Data Warning */}
        {isDemo && (
          <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                ⚠️
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Demo Data Currently Displayed
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  These are sample events because your Google Sheet is not accessible yet.
                </p>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  <strong>To fix:</strong> Make sure your Google Sheet is shared as "Anyone with the link can view"
                  <br />
                  <strong>Sheet ID:</strong> 1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI
                </div>
              </div>
            </div>
          </div>
        )}

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
              const eventDate = new Date(event.date);
              const now = new Date();
              const isUpcoming = eventDate > now;
              
              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={isUpcoming ? "bg-green-500" : "bg-gray-500"}>
                            {isUpcoming ? "Upcoming" : "Past"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{event.clubName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{eventDate.toLocaleDateString()}</span>
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
                      {event.registrationLink ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                            Register
                          </a>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={!isUpcoming}
                        >
                          {isUpcoming ? 'Register' : 'Event Ended'}
                        </Button>
                      )}
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
