'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const AnnouncementsPage = () => {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Mock data - replace with real data from API
  const announcements = [
    {
      id: 1,
      title: "Annual Sports Day Registration Open",
      content: "Registration for the annual sports day is now open! Join us for a day of competition, fun, and school spirit. Multiple sports categories available including basketball, soccer, volleyball, and track events.",
      club: "Sports Committee",
      clubId: 6,
      priority: "high",
      createdAt: "2025-08-23T10:00:00Z",
      author: "Sarah Johnson",
      isRead: false,
      tags: ["Sports", "Registration", "Competition"]
    },
    {
      id: 2,
      title: "New Workshop Series: Web Development Fundamentals",
      content: "We're excited to announce a new 6-week workshop series covering HTML, CSS, JavaScript, and React. Perfect for beginners and those looking to refresh their skills.",
      club: "Computer Science Club",
      clubId: 1,
      priority: "normal",
      createdAt: "2025-08-23T08:30:00Z",
      author: "Alex Chen",
      isRead: true,
      tags: ["Workshop", "Web Development", "Programming"]
    },
    {
      id: 3,
      title: "Cultural Week Planning - Volunteers Needed",
      content: "We're planning our annual cultural week celebration and need volunteers to help with event coordination, decorations, and cultural performances. Great opportunity to earn leadership points!",
      club: "Cultural Society",
      clubId: 5,
      priority: "normal",
      createdAt: "2025-08-22T16:45:00Z",
      author: "Emily Davis",
      isRead: true,
      tags: ["Volunteer", "Cultural", "Event Planning"]
    },
    {
      id: 4,
      title: "Photography Contest - Theme: 'Campus Life'",
      content: "Submit your best photos capturing the essence of campus life! Prizes for top 3 winners including photography equipment and feature in the campus magazine.",
      club: "Photography Club",
      clubId: 2,
      priority: "normal",
      createdAt: "2025-08-22T14:20:00Z",
      author: "Michael Rodriguez",
      isRead: false,
      tags: ["Contest", "Photography", "Campus"]
    },
    {
      id: 5,
      title: "Emergency: Club Meeting Room Changes",
      content: "Due to maintenance work, all club meetings scheduled for Building A this week have been moved to Building B. Please check with your club leaders for specific room assignments.",
      club: "Administration",
      clubId: null,
      priority: "urgent",
      createdAt: "2025-08-22T09:15:00Z",
      author: "Admin Team",
      isRead: false,
      tags: ["Emergency", "Room Change", "Maintenance"]
    },
    {
      id: 6,
      title: "Debate Tournament Registration Deadline Extended",
      content: "Good news! We've extended the registration deadline for the inter-university debate tournament by one week. Don't miss this chance to represent our university!",
      club: "Debate Society",
      clubId: 3,
      priority: "normal",
      createdAt: "2025-08-21T11:30:00Z",
      author: "James Wilson",
      isRead: true,
      tags: ["Debate", "Tournament", "Extended Deadline"]
    }
  ];

  const priorities = ["all", "urgent", "high", "normal", "low"];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !announcement.isRead) ||
                      (activeTab === 'read' && announcement.isRead);
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
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Announcements</TabsTrigger>
            <TabsTrigger value="unread">Unread ({announcements.filter(a => !a.isRead).length})</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
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
                  className={`hover:shadow-lg transition-shadow ${
                    !announcement.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
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
                          {!announcement.isRead && (
                            <Badge variant="default" className="text-xs bg-blue-600">
                              NEW
                            </Badge>
                          )}
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
                          {announcement.isRead ? 'Mark as Unread' : 'Mark as Read'}
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
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {announcements.filter(a => !a.isRead).length}
                  </div>
                  <p className="text-gray-600">Unread Announcements</p>
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
