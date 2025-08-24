// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalNavbar from '@/components/portal-navbar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Users,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  studentId: string | null;
  department: string | null;
  year: string | null;
  bio: string | null;
  points: number;
  image: string | null;
  addresses: Address[];
  clubMemberships: Array<{
    club: {
      id: string;
      name: string;
      category: string;
      logo: string | null;
    };
  }>;
  eventRegistrations: Array<{
    event: {
      id: string;
      title: string;
      date: string;
      venue: string;
    };
  }>;
  ownedClubs: Array<{
    id: string;
    name: string;
    category: string;
    logo: string | null;
    _count: { members: number };
  }>;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentId: '',
    department: '',
    year: '',
    bio: ''
  });
  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    isDefault: false
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    console.log('Profile useEffect triggered:', { status, session });
    if (status === 'loading') {
      console.log('Session still loading...');
      return;
    }
    
    if (session?.user?.id) {
      console.log('User ID found, fetching profile:', session.user.id);
      fetchUserProfile();
    } else if (session && !session.user?.id) {
      console.log('Session exists but no user ID:', session);
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      console.log('User not authenticated');
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await fetch('/api/user/profile');
      console.log('Profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setUserProfile(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          studentId: data.user.studentId || '',
          department: data.user.department || '',
          year: data.user.year || '',
          bio: data.user.bio || ''
        });
      } else {
        const errorText = await response.text();
        console.error('Profile API error:', response.status, errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? { ...prev, ...data.user } : null);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        await fetchUserProfile();
        setAddressForm({
          label: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US',
          isDefault: false
        });
        setShowAddressForm(false);
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      } else {
        throw new Error('Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserProfile();
        toast({
          title: "Success",
          description: "Address deleted successfully"
        });
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Failed to load profile</div>;
  }

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      studentId: userProfile?.studentId || '',
      department: userProfile?.department || '',
      year: userProfile?.year || '',
      bio: userProfile?.bio || ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Leader': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-blue-100 text-blue-800';
      case 'Member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your personal information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your personal details and contact information</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile.image || ''} alt={userProfile.name || 'User'} />
                    <AvatarFallback className="text-xl">
                      {userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {userProfile.name || 'No name set'}
                    </h3>
                    <p className="text-gray-600">{userProfile.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {userProfile.points} Points
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{userProfile.name || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{userProfile.phone || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    {isEditing ? (
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter your student ID"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{userProfile.studentId || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Enter your department"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{userProfile.department || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    {isEditing ? (
                      <Input
                        id="year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., Sophomore, Junior"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{userProfile.year || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-gray-700">{userProfile.bio || 'No bio available'}</p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Addresses</CardTitle>
                  <CardDescription>Manage your saved addresses</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile.addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No addresses saved yet</p>
                    <p className="text-sm">Add your first address to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userProfile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={address.isDefault ? "default" : "outline"}>
                              {address.label}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddressForm && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-4">Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressLabel">Label</Label>
                        <Input
                          id="addressLabel"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          placeholder="e.g., Home, Dorm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressStreet">Street Address</Label>
                        <Input
                          id="addressStreet"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressCity">City</Label>
                        <Input
                          id="addressCity"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressState">State</Label>
                        <Input
                          id="addressState"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressZip">ZIP Code</Label>
                        <Input
                          id="addressZip"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressCountry">Country</Label>
                        <Input
                          id="addressCountry"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          placeholder="US"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isDefault">Set as default address</Label>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddressForm(false);
                          setAddressForm({
                            label: '',
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: 'US',
                            isDefault: false
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddAddress}>
                        Add Address
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Activity & Achievements</CardTitle>
                <CardDescription>Your participation history and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="clubs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="clubs">Clubs</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="clubs" className="space-y-4">
                    {userProfile.clubMemberships.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No club memberships yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userProfile.clubMemberships.map((membership) => (
                          <div key={membership.club.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {membership.club.logo ? (
                                  <img src={membership.club.logo} alt={membership.club.name} className="w-6 h-6" />
                                ) : (
                                  <Users className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{membership.club.name}</h4>
                                <p className="text-sm text-gray-500">{membership.club.category}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="events" className="space-y-4">
                    {userProfile.eventRegistrations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No event registrations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userProfile.eventRegistrations.map((registration, index) => (
                          <div key={`profile-${registration.event.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{registration.event.title}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(registration.event.date).toLocaleDateString()} • {registration.event.venue}
                              </p>
                            </div>
                            <Badge variant="outline">Registered</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="achievements" className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No achievements yet</p>
                      <p className="text-sm">Keep participating to earn achievements!</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Clubs Joined</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {userProfile.clubMemberships.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Events Attended</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {userProfile.eventRegistrations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Total Points</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {userProfile.points}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Clubs Led</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {userProfile.ownedClubs.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Browse Clubs
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Events
                </Button>
                <Button className="w-full" variant="outline">
                  <Award className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
