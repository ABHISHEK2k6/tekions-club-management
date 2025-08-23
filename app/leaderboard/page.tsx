// @ts-nocheck
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PortalNavbar from '@/components/portal-navbar';
import { 
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Star,
  Users,
  Calendar,
  Target
} from 'lucide-react';

const LeaderboardPage = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('individual');

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/sign-in');
  }

  // Mock data - replace with real data from API
  const individualLeaderboard = [
    {
      id: 1,
      rank: 1,
      name: "Alex Chen",
      email: "alex.chen@university.edu",
      points: 485,
      clubsJoined: 5,
      eventsAttended: 12,
      achievements: ["Event Organizer", "Community Leader", "Active Participant"],
      avatar: "/api/placeholder/40/40",
      isCurrentUser: false
    },
    {
      id: 2,
      rank: 2,
      name: "Sarah Johnson",
      email: "sarah.j@university.edu",
      points: 425,
      clubsJoined: 4,
      eventsAttended: 15,
      achievements: ["Photography Expert", "Workshop Leader"],
      avatar: "/api/placeholder/40/40",
      isCurrentUser: false
    },
    {
      id: 3,
      rank: 3,
      name: "Michael Rodriguez",
      email: "m.rodriguez@university.edu",
      points: 380,
      clubsJoined: 3,
      eventsAttended: 10,
      achievements: ["Debate Champion", "Public Speaker"],
      avatar: "/api/placeholder/40/40",
      isCurrentUser: false
    },
    {
      id: 4,
      rank: 4,
      name: "Emily Davis",
      email: "emily.davis@university.edu",
      points: 350,
      clubsJoined: 6,
      eventsAttended: 8,
      achievements: ["Cultural Ambassador"],
      avatar: "/api/placeholder/40/40",
      isCurrentUser: false
    },
    {
      id: 5,
      rank: 5,
      name: "James Wilson",
      email: "james.w@university.edu",
      points: 320,
      clubsJoined: 4,
      eventsAttended: 9,
      achievements: ["Sports Leader"],
      avatar: "/api/placeholder/40/40",
      isCurrentUser: false
    },
    // Current user (example)
    {
      id: 6,
      rank: 12,
      name: session.user?.name || "You",
      email: session.user?.email || "",
      points: 150,
      clubsJoined: 3,
      eventsAttended: 5,
      achievements: ["New Member"],
      avatar: session.user?.image || "/api/placeholder/40/40",
      isCurrentUser: true
    }
  ];

  const clubLeaderboard = [
    {
      id: 1,
      rank: 1,
      name: "Computer Science Club",
      category: "Academic",
      members: 120,
      totalPoints: 2450,
      eventsHosted: 8,
      avgPointsPerMember: 20.4,
      growth: "+15%"
    },
    {
      id: 2,
      rank: 2,
      name: "Cultural Society",
      category: "Cultural",
      members: 200,
      totalPoints: 2100,
      eventsHosted: 15,
      avgPointsPerMember: 10.5,
      growth: "+22%"
    },
    {
      id: 3,
      rank: 3,
      name: "Sports Committee",
      category: "Sports",
      members: 150,
      totalPoints: 1800,
      eventsHosted: 20,
      avgPointsPerMember: 12.0,
      growth: "+8%"
    },
    {
      id: 4,
      rank: 4,
      name: "Photography Club",
      category: "Creative",
      members: 45,
      totalPoints: 900,
      eventsHosted: 5,
      avgPointsPerMember: 20.0,
      growth: "+30%"
    },
    {
      id: 5,
      rank: 5,
      name: "Debate Society",
      category: "Academic",
      members: 80,
      totalPoints: 800,
      eventsHosted: 12,
      avgPointsPerMember: 10.0,
      growth: "+5%"
    }
  ];

  const pointsBreakdown = [
    { activity: "Event Attendance", points: 10, description: "Per event attended" },
    { activity: "Event Organization", points: 50, description: "Per event organized" },
    { activity: "Club Leadership", points: 100, description: "Monthly bonus for leaders" },
    { activity: "Workshop Completion", points: 25, description: "Per workshop completed" },
    { activity: "Community Service", points: 20, description: "Per hour of service" },
    { activity: "Peer Mentoring", points: 15, description: "Per mentoring session" }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">
            See how you rank among your peers and celebrate top performers.
          </p>
        </div>

        {/* Current User Stats */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#{individualLeaderboard.find(u => u.isCurrentUser)?.rank}</div>
                <p className="text-sm text-gray-600">Campus Rank</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{individualLeaderboard.find(u => u.isCurrentUser)?.points}</div>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{individualLeaderboard.find(u => u.isCurrentUser)?.clubsJoined}</div>
                <p className="text-sm text-gray-600">Clubs Joined</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{individualLeaderboard.find(u => u.isCurrentUser)?.eventsAttended}</div>
                <p className="text-sm text-gray-600">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
                <CardDescription>
                  Campus-wide rankings based on activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                    <TabsTrigger value="clubs">Clubs</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="individual" className="mt-6">
                    <div className="space-y-4">
                      {individualLeaderboard.slice(0, 10).map((user) => (
                        <div 
                          key={user.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            user.isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(user.rank)}`}>
                              {getRankIcon(user.rank)}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {user.name} {user.isCurrentUser && <span className="text-blue-600">(You)</span>}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{user.points} points</span>
                                <span>•</span>
                                <span>{user.clubsJoined} clubs</span>
                                <span>•</span>
                                <span>{user.eventsAttended} events</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {user.achievements.slice(0, 2).map((achievement) => (
                              <Badge key={achievement} variant="secondary" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="clubs" className="mt-6">
                    <div className="space-y-4">
                      {clubLeaderboard.map((club) => (
                        <div key={club.id} className="flex items-center justify-between p-4 rounded-lg border bg-white border-gray-200">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(club.rank)}`}>
                              {getRankIcon(club.rank)}
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{club.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{club.totalPoints} total points</span>
                                <span>•</span>
                                <span>{club.members} members</span>
                                <span>•</span>
                                <span>{club.eventsHosted} events</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{club.category}</Badge>
                              <Badge variant="secondary" className="text-green-700 bg-green-100">
                                {club.growth}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {club.avgPointsPerMember} avg points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Points System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Points System
                </CardTitle>
                <CardDescription>
                  How you earn points for activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pointsBreakdown.map((item) => (
                  <div key={item.activity} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{item.activity}</h5>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      +{item.points}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {individualLeaderboard.find(u => u.isCurrentUser)?.achievements.map((achievement) => (
                  <Badge key={achievement} variant="secondary" className="w-full justify-start">
                    {achievement}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Challenge */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-purple-900 mb-2">Community Builder</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Attend 5 events and earn 100 bonus points!
                </p>
                <div className="bg-white rounded-full h-2 mb-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-purple-700">3/5 events completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
