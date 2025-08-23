import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Club {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  category: string;
  isPublic: boolean;
  maxMembers: number | null;
  tags: string[];
  requirements: string | null;
  meetingSchedule: string | null;
  contactEmail: string | null;
  socialLinks: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    name: string | null;
    email: string | null;
  };
  _count: {
    members: number;
  };
  membershipRole: string;
  joinedAt: string;
}

interface UseUserClubsReturn {
  clubs: Club[];
  loading: boolean;
  error: string | null;
  totalJoinedClubs: number;
  refetch: () => void;
}

export function useUserClubs(): UseUserClubsReturn {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJoinedClubs, setTotalJoinedClubs] = useState(0);
  const { data: session, status } = useSession();

  const fetchClubs = async () => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/clubs', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setClubs(data.clubs || []);
        setTotalJoinedClubs(data.totalJoinedClubs || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch clubs');
      }
    } catch (err) {
      console.error('Error fetching user clubs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClubs([]);
      setTotalJoinedClubs(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [session, status]);

  return {
    clubs,
    loading,
    error,
    totalJoinedClubs,
    refetch: fetchClubs,
  };
}
