import { useState, useEffect } from 'react';

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

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  refetch: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try CSV route first (doesn't require API keys)
      const response = await fetch('/api/events/csv');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if this is demo data
      const isDemoData = data.message && data.message.includes('demo data') || 
                        data.events?.some((event: Event) => event.id.startsWith('demo-'));
      
      setIsDemo(isDemoData);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      
      // Fallback to static events if API fails
      setEvents([
        {
          id: 'fallback-1',
          title: 'Gaming Tournament',
          description: 'Annual gaming competition',
          date: '2024-02-15',
          location: 'Gaming Arena',
          currentParticipants: 25,
          maxParticipants: 50,
          category: 'Gaming',
          clubName: 'Gaming Club',
          clubId: 'gaming',
        },
        {
          id: 'fallback-2',
          title: 'Tech Workshop',
          description: 'Learn new technologies',
          date: '2024-02-20',
          location: 'Tech Lab',
          currentParticipants: 15,
          maxParticipants: 30,
          category: 'Technology',
          clubName: 'Tech Club',
          clubId: 'tech',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    isDemo,
    refetch: fetchEvents,
  };
}

// Alternative direct fetch function for server components
export async function getEventsFromSheets(): Promise<Event[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/events/csv`, {
      cache: 'no-store', // Ensure fresh data
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events from sheets:', error);
    // Return fallback events
    return [
      {
        id: 'fallback-1',
        title: 'Gaming Tournament',
        description: 'Annual gaming competition',
        date: '2024-02-15',
        location: 'Gaming Arena',
        currentParticipants: 25,
        maxParticipants: 50,
        category: 'Gaming',
        clubName: 'Gaming Club',
        clubId: 'gaming',
      },
      {
        id: 'fallback-2',
        title: 'Tech Workshop',
        description: 'Learn new technologies',
        date: '2024-02-20',
        location: 'Tech Lab',
        currentParticipants: 15,
        maxParticipants: 30,
        category: 'Technology',
        clubName: 'Tech Club',
        clubId: 'tech',
      },
    ];
  }
}
