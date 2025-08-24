'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/ui/loader';
import PortalNavbar from '@/components/portal-navbar';
import SelectionPanel from '@/components/ui/selection-panel';
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
  Settings
} from 'lucide-react';
import Link from 'next/link';
import AiClubFinder from '@/components/AiClubFinder';
import MiniLoader from '@/components/ui/mini-loader';

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Filter and sort options for the selection panel
  const filterOptions = [
    { id: 'technology', label: 'Technology', value: 'technology', color: '#3b82f6' },
    { id: 'sports', label: 'Sports', value: 'sports', color: '#10b981' },
    { id: 'arts', label: 'Arts', value: 'arts', color: '#8b5cf6' },
    { id: 'music', label: 'Music', value: 'music', color: '#f59e0b' },
    { id: 'academic', label: 'Academic', value: 'academic', color: '#ef4444' },
    { id: 'cultural', label: 'Cultural', value: 'cultural', color: '#06b6d4' },
    { id: 'social service', label: 'Social Service', value: 'social service', color: '#84cc16' },
    { id: 'business', label: 'Business', value: 'business', color: '#f97316' },
  ];

  const sortOptions = [
    { id: 'name', label: 'Name', value: 'name' },
    { id: 'members', label: 'Member Count', value: 'members' },
    { id: 'created', label: 'Date Created', value: 'created' },
    { id: 'events', label: 'Event Count', value: 'events' },
  ];

  useEffect(() => {
    fetchClubs();
    // Get current user ID
    if (session?.user?.email) {
      fetchCurrentUserId();
    }
  }, [session, searchTerm, selectedCategories, sortBy, sortDirection]);

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
      
      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortDirection', sortDirection);
      }

      const response = await fetch(`/api/clubs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const clubsData = await response.json();
      
      // Filter out duplicate clubs based on ID to prevent key conflicts
      const uniqueClubs = clubsData.filter((club: Club, index: number, self: Club[]) => 
        index === self.findIndex((c) => c.id === club.id)
      );
      
      // Also ensure events within clubs are unique
      const cleanedClubs = uniqueClubs.map(club => ({
        ...club,
        events: club.events ? club.events.filter((event, idx, arr) => 
          idx === arr.findIndex(e => e.id === event.id)
        ) : []
      }));
      
      setClubs(cleanedClubs);
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
    <Loader>
      <div className="min-h-screen bg-background">
        <PortalNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}

        {/* AI Club Finder */}
        <AiClubFinder />

        {/* Selection Panel */}
        <div className="mb-6">
          <SelectionPanel
            title="Browse Clubs"
            searchPlaceholder="Search clubs by name, description, or tags..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterOptions={filterOptions}
            selectedFilters={selectedCategories}
            onFilterChange={setSelectedCategories}
            sortOptions={sortOptions}
            selectedSort={sortBy}
            onSortChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalResults={clubs.length}
            showingResults={clubs.length}
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <MiniLoader size="lg" />
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {clubs.length} clubs
              </p>
            </div>

            {/* Clubs Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {clubs.map((club, index) => (
                <Card 
                  key={`club-${club.id}-${index}`} 
                  className={`hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                >
                  <CardHeader className={viewMode === 'list' ? 'flex-shrink-0 w-1/3' : ''}>
                    <div className={`flex items-start ${viewMode === 'list' ? 'flex-col space-y-2' : 'justify-between'}`}>
                      <div className={`flex items-center space-x-3 ${viewMode === 'list' ? 'flex-col space-x-0 space-y-2 text-center' : ''}`}>
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
                          <CardTitle 
                            className={`text-lg ${viewMode === 'list' ? 'text-center text-sm' : ''}`}
                            style={{
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: viewMode === 'list' ? '0.7rem' : '0.9rem',
                              letterSpacing: '0.1em',
                              color: '#000000'
                            }}
                          >
                            {club.name}
                          </CardTitle>
                          <div className={`flex gap-2 mt-1 ${viewMode === 'list' ? 'justify-center flex-wrap' : ''}`}>
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
                      {/* Show manage button for owners in grid mode */}
                      {isClubOwner(club) && viewMode === 'grid' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-2"
                          asChild
                        >
                          <Link href={`/clubs/${club.id}/manage`}>
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={viewMode === 'list' ? 'flex-1' : ''}>
                    <CardDescription className="mb-4">
                      {club.description}
                    </CardDescription>

                    {/* Stats */}
                    <div className={`grid gap-4 mb-4 text-sm text-muted-foreground ${
                      viewMode === 'list' ? 'grid-cols-4' : 'grid-cols-2'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{club._count.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{club._count.events} events</span>
                      </div>
                      {viewMode === 'list' && (
                        <>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Online</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            <span>Open</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'justify-end' : ''}`}>
                      <Button variant="outline" size="sm" className={viewMode === 'grid' ? 'flex-1' : ''} asChild>
                        <Link href={`/clubs/${club.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className={viewMode === 'grid' ? 'flex-1' : ''} asChild>
                        <Link href={`/events?clubId=${club.id}`}>
                          Events
                        </Link>
                      </Button>
                      {/* Show manage button for owners in list mode */}
                      {isClubOwner(club) && viewMode === 'list' && (
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/clubs/${club.id}/manage`}>
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No results */}
            {clubs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    color: '#000000'
                  }}
                >
                  No clubs found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find clubs that match your interests.
                </p>
                <Button asChild>
                  <Link href="/clubs/create">Create a New Club</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </Loader>
  );
};

export default ClubsPage;
