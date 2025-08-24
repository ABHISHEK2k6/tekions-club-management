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
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  MessageSquare,
  Wand2,
  Loader2
} from 'lucide-react';
import AnonymousComplaintBox from '@/components/AnonymousComplaintBox';
import AiSuggestions from '@/components/AiSuggestions';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [sheetAnnouncements, setSheetAnnouncements] = useState<any[]>([]);
  const [sheetEvents, setSheetEvents] = useState<any[]>([]);
  const [loadingSheetData, setLoadingSheetData] = useState(true);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    fetchClub();
    fetchSheetData();
  }, [params.id]);

  useEffect(() => {
    if (session?.user?.id && params.id && !checkingRequestStatus) {
      fetchMembershipRequests();
      checkUserRequestStatus();
    }
  }, [params.id, session?.user?.id]);

  // Refresh request status when the page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.id && params.id) {
        // Small delay to ensure any pending operations are complete
        setTimeout(() => {
          checkUserRequestStatus();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user?.id, params.id]);

  const fetchSheetData = async () => {
    try {
      setLoadingSheetData(true);
      
      // Fetch announcements and events from CSV endpoints
      const [announcementsResponse, eventsResponse] = await Promise.all([
        fetch('/api/announcements/csv'),
        fetch('/api/events/csv')
      ]);

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setSheetAnnouncements(announcementsData.announcements || []);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setSheetEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error);
    } finally {
      setLoadingSheetData(false);
    }
  };

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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Checking request status for user:', currentUserId, 'club:', params.id);
      }
      
      const response = await fetch(`/api/clubs/${params.id}/requests?userId=${currentUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Request status response:', data);
        }
        
        setHasRequestedMembership(data.hasActiveRequest || false);
      } else {
        console.error('Failed to check request status:', response.status);
        setHasRequestedMembership(false);
      }
    } catch (error) {
      console.error('Error checking request status:', error);
      setHasRequestedMembership(false);
    } finally {
      setCheckingRequestStatus(false);
    }
  };

  // Function to refresh request status (can be called from outside)
  const refreshRequestStatus = async () => {
    await checkUserRequestStatus();
  };

  const isUserMember = () => {
    if (!club || !currentUserId) return false;
    return club.members.some(member => member.user.id === currentUserId);
  };

  const isClubOwner = () => {
    if (!club || !currentUserId) return false;
    return club.owner.id === currentUserId || club.owner.email === session?.user?.email;
  };

  const getUserRole = () => {
    if (!club || !currentUserId) return 'non-member';
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('getUserRole debug:', {
        currentUserId,
        ownerId: club.owner.id,
        ownerEmail: club.owner.email,
        sessionEmail: session?.user?.email,
        isOwnerById: club.owner.id === currentUserId,
        isOwnerByEmail: club.owner.email === session?.user?.email
      });
    }
    
    // Check if user is the owner first (by ID or email)
    if (club.owner.id === currentUserId || club.owner.email === session?.user?.email) {
      return 'owner';
    }
    
    // Then check if user is a member
    const member = club.members.find(member => member.user.id === currentUserId);
    return member ? member.role : 'non-member';
  };

  const getFilteredSheetAnnouncements = () => {
    if (!club || !sheetAnnouncements.length) return [];
    
    // Filter announcements by club name (case-insensitive)
    return sheetAnnouncements.filter(announcement => 
      announcement.club?.toLowerCase() === club.name.toLowerCase()
    );
  };

  const getFilteredSheetEvents = () => {
    if (!club || !sheetEvents.length) return [];
    
    // Filter events by club name (case-insensitive)
    return sheetEvents.filter(event => 
      event.clubName?.toLowerCase() === club.name.toLowerCase()
    );
  };

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Club page state:', { 
      hasRequestedMembership, 
      userRole: getUserRole(), 
      currentUserId,
      checkingRequestStatus 
    });
  }

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

        // Show success message first
        toast({
          title: 'Request Sent Successfully! 🎉',
          description: 'Your membership request has been sent to the club owner. You will be notified once it\'s reviewed.',
          duration: 5000,
        });

        // Update state immediately to show "Requested" button
        setHasRequestedMembership(true);
        
        // Refresh club data and check request status after a small delay
        await fetchClub();
        
        // Add a small delay to ensure database consistency
        setTimeout(async () => {
          await checkUserRequestStatus();
        }, 500);
      }

      // Don't call fetchClub and checkUserRequestStatus here since we already called them above for the membership request case
      if (isUserMember()) {
        await fetchClub();
        await checkUserRequestStatus();
      }
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
      const response = await fetch(`/api/clubs/${params.id}/requests/${requestId}/${action}`, {
        method: 'POST',
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
        <div className="flex flex-col items-center justify-center py-12">
          <img
            src="/UI/dino-loader.gif"
            alt="Loading..."
            className="w-28 h-28 mb-4"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-gray-600">Loading club details...</span>
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
                      <Badge variant="default" className="bg-blue-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Owner
                      </Badge>
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
                    <Button variant="outline" asChild>
                      <Link href={`/clubs/${params.id}/manage`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Club
                      </Link>
                    </Button>
                    <Button variant="default" disabled>
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      Owner
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
                          <MiniLoader size="sm" className="mr-2" />
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
                          <MiniLoader size="sm" className="mr-2" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Request Pending
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
                            <MiniLoader size="sm" className="mr-2" />
                            Sending Request...
                          </>
                        ) : checkingRequestStatus ? (
                          <>
                            <MiniLoader size="sm" className="mr-2" />
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
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        asChild
                      >
                        <Link href={`/clubs/${params.id}/manage`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Club
                        </Link>
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Members
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start w-full"
                        onClick={() => window.open('https://docs.google.com/spreadsheets/d/1zQtvcA-BbpM0WIwwXOyMhJ_oi2bTGMYuCphihG5eMhI/edit', '_blank')}
                      >
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
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Members ({club._count.members})
                </CardTitle>
                <CardDescription>
                  {getUserRole() === 'non-member' 
                    ? 'Public member directory' 
                    : 'Club member directory with contact details'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {club.members.slice(0, getUserRole() === 'non-member' ? 4 : 12).map((member) => (
                    <div key={member.user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.user.image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {member.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{member.user.name}</h3>
                            <Badge 
                              variant={member.role === 'admin' ? 'default' : 'outline'} 
                              className={`text-xs ${member.role === 'admin' ? 'bg-blue-600' : ''}`}
                            >
                              {member.role === 'admin' ? 'Lead' : member.role}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-800">
                              <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                              <span className="font-medium text-gray-800">{member.user.email}</span>
                            </div>
                            {member.user.department && (
                              <div className="flex items-center text-sm text-gray-600">
                                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{member.user.department}</span>
                                {member.user.year && <span className="ml-1">• {member.user.year}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {club.members.length > (getUserRole() === 'non-member' ? 4 : 12) && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      {getUserRole() === 'non-member' 
                        ? `Join the club to see all ${club.members.length} members`
                        : `Showing ${getUserRole() === 'non-member' ? 4 : 12} of ${club.members.length} members`
                      }
                    </p>
                    {canViewMemberContent() && (
                      <Button variant="outline" size="sm">
                        View All Members
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Club Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={club.owner.image} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-semibold">
                        {club.owner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{club.owner.name}</h3>
                      <Badge className="bg-yellow-500 text-white mb-2 text-xs">Owner</Badge>
                      <div className="flex items-center text-sm text-gray-800">
                        <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-800">{club.owner.email}</span>
                      </div>
                    </div>
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
                {loadingSheetData ? (
                  <div className="flex justify-center py-4">
                    <MiniLoader />
                  </div>
                ) : (
                  <>
                    {getFilteredSheetAnnouncements().length > 0 ? (
                      <div className="space-y-2">
                        {getFilteredSheetAnnouncements().slice(0, 5).map((announcement) => (
                          <Link 
                            key={announcement.id} 
                            href={`/announcements?highlight=${announcement.id}`}
                            className="block p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-200 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-blue-600 hover:text-blue-800 truncate flex-1 mr-2">
                                {announcement.title}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {announcement.priority && announcement.priority !== 'normal' && (
                                  <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                                    {announcement.priority}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {getFilteredSheetAnnouncements().length > 5 && (
                          <div className="pt-2 border-t">
                            <Link 
                              href="/announcements" 
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View all {getFilteredSheetAnnouncements().length} announcements →
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No announcements yet</p>
                    )}
                    
                    {/* Show database announcements if any */}
                    {club?.announcements && club.announcements.length > 0 && (
                      <>
                        <div className="border-t my-4 pt-4">
                          <p className="text-xs text-gray-400 mb-3">Database Announcements</p>
                          <div className="space-y-2">
                            {club.announcements.slice(0, 3).map((announcement) => (
                              <Link 
                                key={announcement.id} 
                                href={`/announcements?highlight=${announcement.id}`}
                                className="block p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm text-blue-600 hover:text-blue-800 truncate flex-1 mr-2">
                                    {announcement.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSheetData ? (
                  <div className="flex justify-center py-4">
                    <MiniLoader />
                  </div>
                ) : (
                  <>
                    {getFilteredSheetEvents().length > 0 ? (
                      <div className="space-y-2">
                        {getFilteredSheetEvents().slice(0, 5).map((event) => (
                          <Link 
                            key={event.id} 
                            href={`/events/${event.id}`}
                            className="block p-3 border rounded-lg hover:bg-gray-50 hover:border-green-200 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-green-600 hover:text-green-800 truncate flex-1 mr-2">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {event.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {event.category}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {event.location}
                            </p>
                          </Link>
                        ))}
                        {getFilteredSheetEvents().length > 5 && (
                          <div className="pt-2 border-t">
                            <Link 
                              href="/events" 
                              className="text-sm text-green-600 hover:text-green-800 font-medium"
                            >
                              View all {getFilteredSheetEvents().length} events →
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No events yet</p>
                    )}
                    
                    {/* Show database events if any */}
                    {club?.events && club.events.length > 0 && (
                      <>
                        <div className="border-t my-4 pt-4">
                          <p className="text-xs text-gray-400 mb-3">Database Events</p>
                          <div className="space-y-2">
                            {club.events.slice(0, 3).map((event) => (
                              <Link 
                                key={event.id} 
                                href={`/events/${event.id}`}
                                className="block p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-green-200 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm text-green-600 hover:text-green-800 truncate flex-1 mr-2">
                                    {event.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {new Date(event.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {event.venue}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions for Club Members and Leaders */}
            {(isUserMember() || isClubOwner()) && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wand2 className="h-5 w-5 mr-2 text-purple-500" />
                    Club Activity Suggestions
                  </CardTitle>
                  <CardDescription>
                    Get creative ideas for {club.name} activities and events.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AiSuggestions />
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Share Your Feedback</CardTitle>
                    <CardDescription>
                      Help us improve this club and the overall experience.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have suggestions about this club, its events, or general feedback? Your anonymous input helps us create a better experience for everyone.
                </p>
                <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Submit Anonymous Feedback
                    </Button>
                  </DialogTrigger>
                  <AnonymousComplaintBox setDialogOpen={setFeedbackDialogOpen} />
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}