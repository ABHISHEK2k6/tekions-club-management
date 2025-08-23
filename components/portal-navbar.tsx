'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Home,
  PlusCircle
} from 'lucide-react';
import UserAccountNav from '@/components/UserAccountNav';

const PortalNavbar = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Tekions
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              href="/clubs" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Clubs</span>
            </Link>
            
            <Link 
              href="/events" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>
            
            <Link 
              href="/announcements" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Megaphone className="h-4 w-4" />
              <span>Announcements</span>
            </Link>
            
            <Link 
              href="/leaderboard" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center space-x-1"
              asChild
            >
              <Link href="/clubs/create">
                <PlusCircle className="h-4 w-4" />
                <span>Create Club</span>
              </Link>
            </Button>
            
            <UserAccountNav />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PortalNavbar;
