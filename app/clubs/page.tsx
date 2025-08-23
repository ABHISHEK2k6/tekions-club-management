'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PortalNavbar from '@/components/portal-navbar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Heart,
  MapPin,
  Calendar,
  UserPlus,
  Plus,
  Settings,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  events: Array<{
    id: string;
    title: string;
    date: string;
  }>;
  _count: {
    members: number;
    events: number;
  };
  createdAt: string;
}

const ClubsPage = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchClubs();
    // Get current user ID
    if (session?.user?.email) {
      fetchCurrentUserId();
    }
  }, [session, searchTerm, selectedCategory]);

  const fetchCurrentUserId = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/clubs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const clubsData = await response.json();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clubs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'all',
    'Academic',
    'Technology',
    'Arts & Culture',
    'Sports & Recreation',
    'Social Service',
    'Professional Development',
    'Hobby & Interest',
    'Religious & Spiritual',
    'Environmental',
    'Other'
  ];

  const isUserMember = (club: Club) => {
    return club.members.some(member => member.user.id === currentUserId);
  };

  const isClubOwner = (club: Club) => {
    return club.owner.id === currentUserId;
  };

  // Handle loading and authentication states
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tekions</h1>
          <p className="text-muted-foreground mt-2">
            Discover and join clubs that match your interests and passions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clubs by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Club Button */}
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href="/clubs/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Link>
          </Button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {clubs.length} clubs
              </p>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <Card key={club.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {club.logo ? (
                            <img 
                              src={club.logo} 
                              alt={`${club.name} logo`} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <Users className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{club.name}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {club.category}
                            </Badge>
                            {isClubOwner(club) && (
                              <Badge variant="default" className="text-xs bg-blue-600">
                                Owner
                              </Badge>
                            )}
                            {!isClubOwner(club) && isUserMember(club) && (
                              <Badge variant="outline" className="text-xs">
                                Member
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Show different buttons for owner vs regular users */}
                      {isClubOwner(club) && (
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-2"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {club.description}
                    </CardDescription>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{club._count.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{club._count.events} events</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/clubs/${club.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/clubs/${club.id}/events`}>
                          Events
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No results */}
            {clubs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No clubs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find clubs that match your interests.
                </p>
                <Button asChild>
                  <Link href="/clubs/create">Create a New Club</Link>
                </Button>
              </div>
            )}

            {/* Call to action */}
            <div className="mt-12 text-center">
              <Card className="bg-muted border-border">
                <CardContent className="py-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Don't see a club you're interested in?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start your own club and bring together students who share your passion.
                  </p>
                  <Button asChild>
                    <Link href="/clubs/create">Create a New Club</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;
