import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  club: string;
  clubId: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  author: string;
  createdAt: string;
  tags: string[];
  isPublished: boolean;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  success: boolean;
  total: number;
  error?: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/announcements/csv', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnnouncementsResponse = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        throw new Error(data.error || 'Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    refetch: fetchAnnouncements,
  };
};
