import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  category: string;
  clubName: string;
  clubId: string;
  image?: string;
  registrationLink?: string;
}

interface UseEventReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

export function useEvent(eventId: string): UseEventReturn {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching event:', eventId);

        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found');
          }
          throw new Error(`Failed to fetch event: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.error || 'Failed to load event');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
  };
}
