'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import PortalNavbar from '@/components/portal-navbar';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  FileText,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const clubId = searchParams.get('clubId');
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    venue: '',
    maxParticipants: '',
    category: '',
    registrationLink: '',
  });

  useEffect(() => {
    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  const fetchClub = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}`);
      if (response.ok) {
        const clubData = await response.json();
        setClub(clubData);
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.venue) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting event data:', {
        ...formData,
        clubId,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      });

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clubId,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create event');
      }

      const newEvent = await response.json();
      console.log('Event created successfully:', newEvent);

      toast({
        title: 'Success!',
        description: 'Event created successfully.',
      });

      // Redirect back to club page or events page
      if (clubId) {
        router.push(`/clubs/${clubId}`);
      } else {
        router.push('/events');
      }

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => clubId ? router.push(`/clubs/${clubId}`) : router.push('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {club ? club.name : 'Events'}
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
              {club && (
                <p className="text-gray-600">Creating event for <span className="font-medium text-blue-600">{club.name}</span></p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                      <SelectItem value="fundraising">Fundraising</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your event"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Start Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Event location"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="registrationLink">Registration Link</Label>
                  <Input
                    id="registrationLink"
                    type="url"
                    value={formData.registrationLink}
                    onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                    placeholder="https://forms.google.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => clubId ? router.push(`/clubs/${clubId}`) : router.push('/events')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Tips for Creating Great Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Make your title clear and engaging</li>
              <li>• Include all important details in the description</li>
              <li>• Set a realistic participant limit based on your venue</li>
              <li>• Add a registration link if you need to collect attendee information</li>
              <li>• Choose an appropriate category to help people find your event</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
