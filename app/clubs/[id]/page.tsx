'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import PortalNavbar from '@/components/portal-navbar';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Settings,
  UserPlus,
  Share,
  Star,
  Loader2
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      department?: string;
      year?: string;
    };
    role: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    venue: string;
    date: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  _count: {
    members: number;
    events: number;
    announcements: number;
  };
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [hasRequestedMembership, setHasRequestedMembership] = useState(false);
  const [checkingRequestStatus, setCheckingRequestStatus] = useState(false);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    fetchClub();
    if (session?.user?.id) {
      fetchMembershipRequests();
      checkUserRequestStatus();
    }
  }, [params.id, session?.user?.id]);

  const fetchClub = async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setClub(null);
          return;
        }
        throw new Error('Failed to fetch club');
      }

      const clubData = await response.json();
      setClub(clubData);
    } catch (error) {
      console.error('Error fetching club:', error);
      setClub(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipRequests = async () => {
    if (!params.id) return;

    try {
      setRequestsLoading(true);
      const response = await fetch(`/api/clubs/${params.id}/requests`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setMembershipRequests([]);
          return;
        }
        throw new Error('Failed to fetch membership requests');
      }

      const requestsData = await response.json();
      setMembershipRequests(requestsData);
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      setMembershipRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const checkUserRequestStatus = async () => {
    if (!params.id || !currentUserId) return;

    try {
      setCheckingRequestStatus(true);
      const response = await fetch(`/api/clubs/${params.id}/requests?userId=${currentUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        setHasRequestedMembership(data.hasActiveRequest || false);
      }
    } catch (error) {
      console.error('Error checking request status:', error);
      setHasRequestedMembership(false);
    } finally {
      setCheckingRequestStatus(false);
    }
  };

  const isUserMember = () => {
    if (!club || !currentUserId) return false;
    return club.members.some(member => member.user.id === currentUserId);
  };

  const isClubOwner = () => {
    if (!club || !currentUserId) return false;
    return club.owner.id === currentUserId;
  };

  const getUserRole = () => {
    if (!club || !currentUserId) return 'non-member';
    if (club.owner.id === currentUserId) return 'owner';
    if (club.members.some(member => member.user.id === currentUserId)) return 'member';
    return 'non-member';
  };

  const canViewManagement = () => getUserRole() === 'owner';
  const canViewMemberContent = () => ['owner', 'member'].includes(getUserRole());

  const handleJoinLeave = async () => {
    if (!club || !currentUserId || isJoining) return;

    try {
      setIsJoining(true);
      
      if (isUserMember()) {
        const response = await fetch(`/api/clubs/${club.id}/join`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to leave club');
        }

        toast({
          title: 'Success!',
          description: 'You have left the club.',
        });
      } else {
        const response = await fetch(`/api/clubs/${club.id}/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send membership request');
        }

        setHasRequestedMembership(true);
        toast({
          title: 'Request Sent Successfully! 🎉',
          description: 'Your membership request has been sent to the club owner. You will be notified once it\'s reviewed.',
          duration: 5000,
        });
      }

      await fetchClub();
      await checkUserRequestStatus();
    } catch (error) {
      console.error('Error updating membership:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update membership. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleMembershipRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} membership request`);
      }

      toast({
        title: 'Success!',
        description: `Membership request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      await fetchClub();
      await fetchMembershipRequests();
      await checkUserRequestStatus(); // Refresh request status
    } catch (error) {
      console.error('Error handling membership request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PortalNavbar />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PortalNavbar />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h1>
          <p className="text-gray-600 mb-8">The club you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/clubs">Back to Clubs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{club.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="secondary">{club.category}</Badge>
                    {getUserRole() === 'owner' && (
                      <Badge variant="default" className="bg-blue-600">Owner</Badge>
                    )}
                    {getUserRole() === 'member' && (
                      <Badge variant="outline">Member</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{club._count.members} members</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{club._count.events} events</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                {getUserRole() === 'owner' && (
                  <>
                    <Button variant="default">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Club
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Members
                    </Button>
                  </>
                )}
                
                {getUserRole() === 'member' && (
                  <>
                    <Button variant="default" disabled>
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      Member
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleJoinLeave}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Leaving...
                        </>
                      ) : (
                        'Leave Club'
                      )}
                    </Button>
                  </>
                )}
                
                {getUserRole() === 'non-member' && (
                  <>
                    {hasRequestedMembership ? (
                      <Button
                        variant="outline"
                        disabled
                        className="bg-orange-50 border-orange-200 text-orange-600"
                      >
                        {checkingRequestStatus ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Requested
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleJoinLeave}
                        disabled={isJoining || checkingRequestStatus}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Request...
                          </>
                        ) : checkingRequestStatus ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Request to Join
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
                
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{club.description}</p>
              </CardContent>
            </Card>

            {canViewManagement() && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Club Management</CardTitle>
                    <CardDescription>Full club administration and settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Members
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Club Settings
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Budget, expenses, and financial reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800">Total Budget</h4>
                        <p className="text-2xl font-bold text-green-600">₹50,000</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Expenses</h4>
                        <p className="text-2xl font-bold text-blue-600">₹32,500</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Detailed Reports</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Membership Requests</CardTitle>
                    <CardDescription>Review and approve pending membership requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading requests...
                      </div>
                    ) : membershipRequests.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No pending membership requests</p>
                    ) : (
                      <div className="space-y-4">
                        {membershipRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={request.user.image} />
                                <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.user.name}</p>
                                <p className="text-sm text-gray-600">
                                  {request.user.department} • {request.user.year}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Requested {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleMembershipRequest(request.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMembershipRequest(request.id, 'reject')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {canViewMemberContent() && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Reports & Analytics</CardTitle>
                    <CardDescription>Detailed insights and analytics for past events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">15</p>
                          <p className="text-sm text-gray-600">Events Hosted</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">450</p>
                          <p className="text-sm text-gray-600">Total Attendees</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">4.8</p>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Detailed Analytics</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Member Resources</CardTitle>
                    <CardDescription>Exclusive resources and materials for club members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Meeting Minutes - July 2025</h4>
                          <p className="text-sm text-gray-600">Discussion points and action items</p>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Event Planning Guide</h4>
                          <p className="text-sm text-gray-600">Step-by-step event organization</p>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Budget Templates</h4>
                          <p className="text-sm text-gray-600">Excel templates for event budgeting</p>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>
                  {getUserRole() === 'non-member' 
                    ? 'Public events and activities' 
                    : 'Complete event history and upcoming activities'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {club.events && club.events.length > 0 ? (
                  <div className="space-y-4">
                    {club.events.slice(0, getUserRole() === 'non-member' ? 3 : undefined).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.venue} • {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        {canViewMemberContent() && (
                          <Button variant="outline" size="sm">View Details</Button>
                        )}
                      </div>
                    ))}
                    {getUserRole() === 'non-member' && club.events.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        Join the club to see all {club.events.length} events
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No events available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Members ({club._count.members})</CardTitle>
                <CardDescription>
                  {getUserRole() === 'non-member' 
                    ? 'Public member directory' 
                    : 'Club member directory with contact details'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {club.members.slice(0, getUserRole() === 'non-member' ? 4 : 8).map((member) => (
                    <div key={member.user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.user.name}</p>
                        {canViewMemberContent() ? (
                          <>
                            <p className="text-sm text-gray-600">
                              {member.user.department} • {member.user.year}
                            </p>
                            <p className="text-xs text-gray-500">{member.user.email}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">{member.user.department}</p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">{member.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {club.members.length > (getUserRole() === 'non-member' ? 4 : 8) && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    {getUserRole() === 'non-member' 
                      ? `Join the club to see all ${club.members.length} members`
                      : `And ${club.members.length - 8} more members...`
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={club.owner.image} />
                    <AvatarFallback>{club.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{club.owner.name}</p>
                    {canViewMemberContent() ? (
                      <p className="text-sm text-gray-600">{club.owner.email}</p>
                    ) : (
                      <p className="text-sm text-gray-600">Club Leader</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-medium">{club._count.members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-medium">{club._count.events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Announcements</span>
                  <span className="font-medium">{club._count.announcements}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                {club.announcements.length > 0 ? (
                  <div className="space-y-4">
                    {club.announcements.slice(0, 3).map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={announcement.author.image} />
                            <AvatarFallback>{announcement.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm">{announcement.title}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(announcement.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                            <p className="text-xs text-gray-500 mt-2">By {announcement.author.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No announcements yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}