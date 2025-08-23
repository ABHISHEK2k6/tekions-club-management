'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalNavbar from '@/components/portal-navbar';
import { useEvent } from '@/hooks/use-event';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Users,
  ExternalLink,
  Share,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const EventDetailPage = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { event, loading, error } = useEvent(params.id as string);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Here you would make an API call to register for the event
      console.log('Registering for event:', event.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsRegistered(!isRegistered);
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Time TBA';
  };

  const isEventPast = (dateString: string) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate < today;
    } catch (error) {
      return false;
    }
  };

  const getEventStatus = () => {
    if (isEventPast(event.date)) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
    return { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          {/* Event Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{event.title}</h1>
                <p className="text-lg text-muted-foreground">{event.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={eventStatus.color}>
                  <eventStatus.icon className="h-3 w-3 mr-1" />
                  {eventStatus.label}
                </Badge>
                {event.category && (
                  <Badge variant="outline">{event.category}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    
                    {event.endDate && event.endDate !== event.date && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">End Date</p>
                          <p className="text-sm text-muted-foreground">{formatDate(event.endDate)}</p>
                        </div>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {event.maxParticipants && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p className="text-sm text-muted-foreground">
                            {event.currentParticipants} / {event.maxParticipants} registered
                          </p>
                        </div>
                      </div>
                    )}

                    {event.clubName && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Organized by</p>
                          <p className="text-sm text-muted-foreground">{event.clubName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registration Link */}
                  {event.registrationLink && (
                    <div className="pt-4 border-t">
                      <Button asChild className="w-full sm:w-auto">
                        <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Registration Link
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Description */}
              {event.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              {!isEventPast(event.date) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="w-full"
                      variant={isRegistered ? "outline" : "default"}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isRegistered ? 'Unregister' : 'Register for Event'}
                    </Button>
                    
                    {isRegistered && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        You're registered for this event
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Share Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    Share Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: event.title,
                          text: event.description,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        // You could show a toast here
                      }
                    }}
                  >
                    Share Event
                  </Button>
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Event ID</p>
                    <p className="text-muted-foreground">{event.id}</p>
                  </div>
                  
                  {event.category && (
                    <div className="text-sm">
                      <p className="font-medium">Category</p>
                      <p className="text-muted-foreground">{event.category}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
