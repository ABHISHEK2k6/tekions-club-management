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
  Check
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

  useEffect(() => {
    if (params.id) {
      fetchClub();
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

            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Club Details</TabsTrigger>
                <TabsTrigger value="members">Members ({club._count.members})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="danger">Danger Zone</TabsTrigger>
              </TabsList>

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
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>Manage member roles and permissions</CardDescription>
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

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Club Settings</CardTitle>
                    <CardDescription>Configure your club's visibility and access settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
