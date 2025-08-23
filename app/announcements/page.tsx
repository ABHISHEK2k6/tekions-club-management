'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PortalNavbar from '@/components/portal-navbar';
import { useAnnouncements } from '@/hooks/use-announcements';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const AnnouncementsPage = () => {
  const { data: session, status } = useSession();
  const { announcements, loading, error } = useAnnouncements();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <PortalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading announcements...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <PortalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Announcements</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorities = ["all", "urgent", "high", "normal", "medium", "low"];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // More explicit priority matching
    let matchesPriority = false;
    if (selectedPriority === 'all') {
      matchesPriority = true; // Show all priorities when 'all' is selected
    } else {
      matchesPriority = announcement.priority.trim().toLowerCase() === selectedPriority.trim().toLowerCase();
    }
    
    // For now, we'll treat all announcements as "read" since the sheet doesn't have this field
    const matchesTab = activeTab === 'all' || activeTab === 'read';
    
    return matchesSearch && matchesPriority && matchesTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with the latest news and updates from your clubs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Priority Filter */}
          <div className="w-full sm:w-48">
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <button
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : ''
              }`}
            >
              All Announcements ({announcements.length})
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'read' ? 'bg-background text-foreground shadow-sm' : ''
              }`}
            >
              Published ({announcements.length})
            </button>
          </div>

          <div className="mt-6">
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAnnouncements.length} announcements
              </p>
            </div>

            {/* Announcements List */}
            <div className="space-y-6">
              {filteredAnnouncements.map((announcement) => (
                <Card 
                  key={announcement.id} 
                  className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-blue-50/30"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(announcement.priority)}
                          <Badge 
                            variant={getPriorityColor(announcement.priority)}
                            className="text-xs"
                          >
                            {announcement.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="default" className="text-xs bg-green-600">
                            PUBLISHED
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium text-blue-600">{announcement.club}</span>
                          <span>•</span>
                          <span>by {announcement.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {announcement.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {announcement.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {announcement.clubId && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/clubs/${announcement.clubId}`}>
                              View Club
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Mark as Read
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No results */}
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find announcements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {announcements.length}
                  </div>
                  <p className="text-gray-600">Total Announcements</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
                  </div>
                  <p className="text-gray-600">High Priority</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(announcements.map(a => a.club)).size}
                  </div>
                  <p className="text-gray-600">Active Clubs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
