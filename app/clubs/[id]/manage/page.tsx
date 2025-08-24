'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PortalNavbar from '@/components/portal-navbar';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  Shield,
  Crown,
  UserMinus,
  UserPlus,
  AlertTriangle,
  Check,
  Calendar,
  Megaphone,
  BarChart3,
  Download,
  Mail,
  Bell,
  Star,
  TrendingUp,
  Eye,
  FileText,
  UserCheck,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import MiniLoader from '@/components/ui/mini-loader';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  isPublic: boolean;
  maxMembers?: number;
  tags: string[];
  requirements?: string;
  meetingSchedule?: string;
  contactEmail?: string;
  socialLinks?: any;
  isActive: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      department?: string;
      year?: string;
    };
  }>;
  _count: {
    members: number;
    events: number;
    announcements: number;
  };
}

export default function ManageClubPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    maxMembers: '',
    tags: '',
    requirements: '',
    meetingSchedule: '',
    contactEmail: '',
  });

  const [newTag, setNewTag] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (params.id) {
      fetchClub();
      fetchAnalytics();
      fetchPendingRequests();
      fetchNotifications();
    }
  }, [params.id]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch club');
      }

      const clubData = await response.json();
      setClub(clubData);
      
      // Populate form data
      setFormData({
        name: clubData.name || '',
        description: clubData.description || '',
        category: clubData.category || '',
        isPublic: clubData.isPublic ?? true,
        maxMembers: clubData.maxMembers?.toString() || '',
        tags: '',
        requirements: clubData.requirements || '',
        meetingSchedule: clubData.meetingSchedule || '',
        contactEmail: clubData.contactEmail || '',
      });
      
      setTagsList(clubData.tags || []);
    } catch (error) {
      console.error('Error fetching club:', error);
      toast({
        title: 'Error',
        description: 'Failed to load club details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/requests`);
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkPermission = () => {
    if (!club || !session?.user?.email) return false;
    // Only club owner can manage club
    return club.owner.email === session.user.email;
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    if (!checkPermission()) {
      toast({
        title: 'Permission Denied',
        description: 'Only club owners can manage club settings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        tags: tagsList,
      };

      const response = await fetch(`/api/clubs/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update club');
      }

      toast({
        title: 'Success!',
        description: 'Club details updated successfully.',
      });

      await fetchClub(); // Refresh data
    } catch (error) {
      console.error('Error updating club:', error);
      toast({
        title: 'Error',
        description: 'Failed to update club details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!checkPermission()) {
      toast({
        title: 'Permission Denied',
        description: 'Only club owners can delete clubs.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/clubs/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete club');
      }

      toast({
        title: 'Club Deleted',
        description: 'The club has been permanently deleted.',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting club:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete club. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/requests/${requestId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      toast({
        title: 'Success!',
        description: 'Membership request approved.',
      });

      await fetchPendingRequests();
      await fetchClub();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve request.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/requests/${requestId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      toast({
        title: 'Request Rejected',
        description: 'Membership request has been rejected.',
      });

      await fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request.',
        variant: 'destructive',
      });
    }
  };

  const handleSendNotification = async (message: string, priority: string = 'normal') => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, priority }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      toast({
        title: 'Success!',
        description: 'Notification sent to all members.',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification.',
        variant: 'destructive',
      });
    }
  };

  const exportMemberList = () => {
    if (!club) return;
    
    const csvContent = [
      ['Name', 'Email', 'Department', 'Year', 'Role', 'Joined Date'],
      ...club.members.map(member => [
        member.user.name,
        member.user.email,
        member.user.department || 'N/A',
        member.user.year || 'N/A',
        member.role,
        new Date(member.joinedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${club.name}-members.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMemberRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      toast({
        title: 'Success!',
        description: 'Member role updated successfully.',
      });

      await fetchClub(); // Refresh data
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      toast({
        title: 'Success!',
        description: 'Member removed from club.',
      });

      await fetchClub(); // Refresh data
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PortalNavbar />
        <div className="flex items-center justify-center py-12">
          <MiniLoader size="lg" />
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
          <Button asChild>
            <Link href="/clubs">Back to Clubs</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!checkPermission()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PortalNavbar />
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">Only club owners can access the management panel.</p>
          <Button asChild>
            <Link href={`/clubs/${params.id}`}>Back to Club</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categories = [
    'academic', 'sports', 'arts', 'technology', 'music', 'drama', 'dance',
    'photography', 'literature', 'debate', 'social service', 'environmental',
    'cultural', 'gaming', 'business', 'other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href={`/clubs/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Club
            </Link>
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{club.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default" className="bg-blue-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Club Owner
                    </Badge>
                    <Badge variant="outline">{club.category}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleSaveChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <MiniLoader size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="members">Members ({club._count.members})</TabsTrigger>
                <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="danger">Danger Zone</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Members</p>
                          <p className="text-2xl font-bold">{club._count.members}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Events</p>
                          <p className="text-2xl font-bold">{club._count.events}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Megaphone className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Announcements</p>
                          <p className="text-2xl font-bold">{club._count.announcements}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Growth</p>
                          <p className="text-2xl font-bold">+12%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Frequently used management actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link href={`/clubs/${params.id}/events/create`}>
                          <Calendar className="h-6 w-6 mb-2" />
                          Create Event
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link href={`/clubs/${params.id}/announcements/create`}>
                          <Megaphone className="h-6 w-6 mb-2" />
                          Announce
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="h-20 flex-col" onClick={exportMemberList}>
                        <Download className="h-6 w-6 mb-2" />
                        Export Members
                      </Button>
                      
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link href={`/clubs/${params.id}/analytics`}>
                          <BarChart3 className="h-6 w-6 mb-2" />
                          Analytics
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest club activities and member interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map((notification, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your club's basic details and information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Club Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter club name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your club's purpose and activities"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxMembers">Maximum Members</Label>
                        <Input
                          id="maxMembers"
                          type="number"
                          value={formData.maxMembers}
                          onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                          placeholder="Leave empty for unlimited"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          placeholder="contact@yourclub.com"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="requirements">Membership Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={formData.requirements}
                          onChange={(e) => handleInputChange('requirements', e.target.value)}
                          placeholder="Any specific requirements for joining this club"
                          rows={3}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                        <Input
                          id="meetingSchedule"
                          value={formData.meetingSchedule}
                          onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                          placeholder="e.g., Every Friday 4-5 PM, Room 101"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Add tags to help people discover your club</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button onClick={handleAddTag} variant="outline">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {tagsList.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Member Management</CardTitle>
                        <CardDescription>Manage member roles and permissions</CardDescription>
                      </div>
                      <Button onClick={exportMemberList} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {club.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.user.image} />
                              <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-sm text-gray-600">{member.user.email}</p>
                              {member.user.department && (
                                <p className="text-xs text-gray-500">
                                  {member.user.department} • {member.user.year}
                                </p>
                              )}
                              <div className="flex items-center mt-1">
                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                  {member.role === 'admin' ? <Crown className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                                  {member.role}
                                </Badge>
                                <span className="text-xs text-gray-500 ml-2">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select
                              className="flex h-8 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={member.role}
                              onChange={(e) => handleMemberRoleChange(member.id, e.target.value)}
                            >
                              <option value="member">Member</option>
                              <option value="admin">Lead</option>
                              <option value="moderator">Moderator</option>
                            </select>
                            
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`mailto:${member.user.email}`}>
                                <Mail className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.user.name} from the club?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Membership Requests</CardTitle>
                    <CardDescription>Review and approve pending membership requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={request.user.image} />
                              <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.user.name}</p>
                              <p className="text-sm text-gray-600">{request.user.email}</p>
                              {request.user.department && (
                                <p className="text-xs text-gray-500">
                                  {request.user.department} • {request.user.year}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                                  "{request.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {pendingRequests.length === 0 && (
                        <div className="text-center py-8">
                          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No pending membership requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Club Settings</CardTitle>
                    <CardDescription>Configure your club's visibility and access settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Public Club</Label>
                        <p className="text-sm text-gray-600">Allow anyone to discover and join your club</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Require Approval</Label>
                        <p className="text-sm text-gray-600">Manually approve new members before they can join</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {}}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Center</CardTitle>
                    <CardDescription>Send announcements and notifications to all members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NotificationCenter onSend={handleSendNotification} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Club Statistics</CardTitle>
                    <CardDescription>Overview of your club's performance and engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-sm text-gray-600">Profile Views</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">4.8</p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="danger" className="space-y-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 className="font-medium text-red-800">Delete Club</h4>
                        <p className="text-sm text-red-600">
                          Permanently delete this club and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={deleteLoading}>
                            {deleteLoading ? (
                              <MiniLoader size="sm" className="mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete Club
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the club "{club.name}" 
                              and all associated data including members, events, and announcements.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteClub}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Yes, delete club
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Center Component
function NotificationCenter({ onSend }: { onSend: (message: string, priority: string) => void }) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await onSend(message, priority);
      setMessage('');
      setPriority('normal');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notification-message">Message</Label>
        <Textarea
          id="notification-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your notification message here..."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <Button onClick={handleSend} disabled={sending || !message.trim()}>
        {sending ? (
          <>
            <MiniLoader size="sm" className="mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Send Notification
          </>
        )}
      </Button>
    </div>
  );
}
