'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Users,
  DollarSign,
  Star,
  Share,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';

const EventDetailPage = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Mock event data - in real app, fetch based on params.id
  const event = {
    id: params.id,
    title: 'React Workshop Series - Advanced Patterns',
    description: 'Join us for an intensive workshop covering advanced React patterns including custom hooks, context patterns, compound components, and performance optimization techniques. This hands-on session is perfect for developers looking to take their React skills to the next level.',
    fullDescription: `This comprehensive workshop will cover:
    
    • Advanced React Hooks (useCallback, useMemo, useRef, custom hooks)
    • Context API and state management patterns
    • Compound components and render props
    • Performance optimization techniques
    • Testing strategies for complex components
    • Real-world project examples
    
    Prerequisites:
    • Basic knowledge of React and JavaScript
    • Experience with React hooks
    • Laptop with Node.js installed
    
    What you'll get:
    • Workshop materials and code examples
    • Certificate of completion
    • Access to our private Discord community
    • Follow-up Q&A session`,
    date: '2025-08-28',
    time: '2:00 PM - 5:00 PM',
    location: 'Computer Lab, Building A, Room 301',
    club: {
      id: 1,
      name: 'Computer Science Club',
      logo: '/api/placeholder/40/40'
    },
    organizer: {
      name: 'Sarah Kim',
      title: 'Senior Developer at TechCorp',
      avatar: '/api/placeholder/60/60'
    },
    capacity: 50,
    registered: 32,
    price: 'Free',
    status: 'open', // open, full, cancelled
    tags: ['React', 'JavaScript', 'Web Development', 'Workshop'],
    requirements: ['Laptop', 'Basic React knowledge'],
    rating: 4.9,
    difficulty: 'Intermediate',
    type: 'Workshop',
    duration: '3 hours'
  };

  const registeredAttendees = [
    { name: 'Alex Chen', avatar: '/api/placeholder/32/32', year: 'Senior' },
    { name: 'Mike Johnson', avatar: '/api/placeholder/32/32', year: 'Junior' },
    { name: 'Emily Davis', avatar: '/api/placeholder/32/32', year: 'Sophomore' },
    { name: 'James Wilson', avatar: '/api/placeholder/32/32', year: 'Senior' },
    { name: 'Lisa Park', avatar: '/api/placeholder/32/32', year: 'Junior' },
  ];

  const relatedEvents = [
    {
      id: 2,
      title: 'Node.js Backend Development',
      date: '2025-09-05',
      club: 'Computer Science Club',
      attendees: 28
    },
    {
      id: 3,
      title: 'UI/UX Design Principles',
      date: '2025-09-10',
      club: 'Design Club',
      attendees: 45
    },
    {
      id: 4,
      title: 'Git & GitHub Workshop',
      date: '2025-09-12',
      club: 'Computer Science Club',
      attendees: 38
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle className="h-4 w-4" />;
      case 'full': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1 capitalize">{event.status}</span>
                      </Badge>
                      <Badge variant="outline">{event.type}</Badge>
                      <Badge className={getDifficultyColor(event.difficulty)}>
                        {event.difficulty}
                      </Badge>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {event.rating}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-gray-600">
                        {event.registered} / {event.capacity} registered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-600">{event.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Price</p>
                      <p className="text-sm text-gray-600">{event.price}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                    {event.fullDescription}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                    <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">{event.organizer.name}</h4>
                    <p className="text-gray-600">{event.organizer.title}</p>
                    <Link 
                      href={`/clubs/${event.club.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {event.club.name}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Attendees ({event.registered})</span>
                  <Badge variant="secondary">{event.capacity - event.registered} spots left</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {registeredAttendees.map((attendee, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-gray-600">{attendee.year}</p>
                      </div>
                    </div>
                  ))}
                  {event.registered > 5 && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">+{event.registered - 5}</span>
                      </div>
                      <p className="text-sm">more attendees</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{event.price}</div>
                  <p className="text-gray-600">Per person</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Registered</span>
                    <span>{event.registered}/{event.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isLoading || event.status === 'full' || event.status === 'cancelled'}
                >
                  {isLoading ? 'Processing...' : 
                   isRegistered ? 'Registered ✓' : 
                   event.status === 'full' ? 'Event Full' :
                   event.status === 'cancelled' ? 'Event Cancelled' :
                   'Register Now'}
                </Button>

                {event.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Events */}
            <Card>
              <CardHeader>
                <CardTitle>Related Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedEvents.map((relatedEvent) => (
                    <Link 
                      key={relatedEvent.id}
                      href={`/events/${relatedEvent.id}`}
                      className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-sm">{relatedEvent.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(relatedEvent.date).toLocaleDateString()} • {relatedEvent.club}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {relatedEvent.attendees} attending
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Type</span>
                    <span className="font-medium">{event.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-medium">{event.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {event.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{event.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
