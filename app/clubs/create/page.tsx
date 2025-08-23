// @ts-nocheck
'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PortalNavbar from '@/components/portal-navbar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  ImageIcon, 
  Upload,
  ArrowLeft,
  Plus,
  X,
  Loader2
} from 'lucide-react';

const CreateClubPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    maxMembers: '',
    tags: [] as string[],
    requirements: '',
    meetingSchedule: '',
    contactEmail: '',
    socialLinks: {
      website: '',
      instagram: '',
      twitter: '',
      discord: ''
    }
  });
  const [currentTag, setCurrentTag] = useState('');

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  const categories = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          logo: uploadedImageUrl,
          maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create club');
      }

      toast({
        title: 'Success!',
        description: 'Club created successfully.',
      });

      // Redirect to the newly created club
      router.push(`/clubs/${data.id}`);
    } catch (error) {
      console.error('Error creating club:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create club. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/club-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setUploadedImageUrl(data.url);
      toast({
        title: 'Success!',
        description: 'Image uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Club</h1>
          <p className="text-gray-600 mt-2">
            Start a new club and build a community around your interests.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your club.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="club-name">Club Name *</Label>
                  <Input
                    id="club-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your club name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what your club is about, its mission, and activities"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  {/* @ts-ignore - TypeScript issue with Radix UI components */}
                  <Select value={formData.category} onValueChange={(value: string) => handleInputChange('category', value)}>
                    {/* @ts-ignore */}
                    <SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    {/* @ts-ignore */}
                    <SelectContent>
                      {categories.map((category) => (
                        /* @ts-ignore */
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>                  <div>
                    <Label htmlFor="max-members">Maximum Members</Label>
                    <Input
                      id="max-members"
                      type="number"
                      value={formData.maxMembers}
                      onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* @ts-ignore - TypeScript issue with Radix UI components */}
                  {/* @ts-ignore */}
                  <Checkbox 
                    id="is-public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, isPublic: checked})}
                  />
                  <Label htmlFor="is-public">Make this club public and discoverable</Label>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Help members understand your club better.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="requirements">Membership Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Any specific requirements or prerequisites for joining"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="meeting-schedule">Meeting Schedule</Label>
                  <Input
                    id="meeting-schedule"
                    value={formData.meetingSchedule}
                    onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                    placeholder="e.g., Every Friday at 3 PM in Room 201"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Email for club inquiries"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add tags (e.g., programming, design)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Links</CardTitle>
                <CardDescription>
                  Add links to help members connect with your club online.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.socialLinks.website}
                      onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      placeholder="https://yourclub.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="@yourclub"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      placeholder="@yourclub"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discord">Discord</Label>
                    <Input
                      id="discord"
                      value={formData.socialLinks.discord}
                      onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                      placeholder="Discord server invite link"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Club Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Club Image
                </CardTitle>
                <CardDescription>
                  Upload a logo or image to represent your club.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadedImageUrl ? (
                  <div className="text-center">
                    <img
                      src={uploadedImageUrl}
                      alt="Club logo preview"
                      className="mx-auto mb-4 h-32 w-32 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Change Image'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600 mb-2">Uploading image...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={triggerFileInput}
                        >
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading || !formData.name || !formData.description || !formData.category}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Club...
                  </>
                ) : (
                  'Create Club'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubPage;
