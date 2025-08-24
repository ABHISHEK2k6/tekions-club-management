'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Calendar, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Home,
  PlusCircle,
  ChevronDown,
  Building2,
  UserPlus,
  Trophy,
  Bookmark,
  Search,
  Filter,
  Menu,
  X
} from 'lucide-react';
import UserAccountNav from '@/components/UserAccountNav';

const PortalNavbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) {
    return null;
  }

  const isActiveLink = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/clubs', label: 'Clubs', icon: Users },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ];

  return (
    <nav 
      className="shadow-sm sticky top-0 z-50"
      style={{ 
        background: '#FBFBF1', 
        borderBottom: '2px solid #5A5B55',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div 
                className="text-white p-2 rounded-lg group-hover:scale-105 transition-transform"
                style={{ background: '#5A5B55' }}
              >
                <Users className="h-6 w-6" />
              </div>
              <span 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: "'Press Start 2P', monospace",
                  color: '#000000',
                  letterSpacing: '0.1em',
                  fontSize: '1rem'
                }}
              >
                Tekions
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);
              
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? 'font-bold' : ''
                  }`}
                  style={{
                    color: isActive ? '#000000' : '#5A5B55',
                    backgroundColor: isActive ? 'rgba(90, 91, 85, 0.1)' : 'transparent',
                    border: isActive ? '1px solid #5A5B55' : '1px solid transparent',
                    fontFamily: isActive ? "'Press Start 2P', monospace" : 'inherit',
                    fontSize: isActive ? '0.7rem' : '0.875rem',
                    letterSpacing: isActive ? '0.1em' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(90, 91, 85, 0.05)';
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#5A5B55';
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.href === '/announcements' && (
                    <Badge 
                      className="ml-1 text-xs"
                      style={{ 
                        background: '#5A5B55', 
                        color: '#FBFBF1',
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '0.6rem'
                      }}
                    >
                      3
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">

            <ThemeToggle />
            
            {/* Create Club Button */}
            <Button 
              size="sm" 
              className="hidden lg:flex items-center space-x-1"
              style={{
                background: '#5A5B55',
                color: '#FBFBF1',
                border: '2px solid #000000',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                padding: '0.5rem 1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#FBFBF1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#5A5B55';
                e.currentTarget.style.color = '#FBFBF1';
              }}
              asChild
            >
              <Link href="/clubs/create">
                <PlusCircle className="h-4 w-4" />
                <span>Create Club</span>
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              style={{ color: '#5A5B55' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <UserAccountNav />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden"
            style={{ backgroundColor: '#FBFBF1' }}
          >
            <div 
              className="px-2 pt-2 pb-3 space-y-1 border-t"
              style={{ 
                backgroundColor: '#FBFBF1',
                borderTopColor: '#5A5B55'
              }}
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    style={{
                      color: isActive ? '#000000' : '#5A5B55',
                      backgroundColor: isActive ? 'rgba(90, 91, 85, 0.1)' : 'transparent',
                      border: isActive ? '1px solid #5A5B55' : '1px solid transparent',
                      fontFamily: isActive ? "'Press Start 2P', monospace" : 'inherit',
                      fontSize: isActive ? '0.7rem' : '0.875rem',
                      letterSpacing: isActive ? '0.1em' : 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(90, 91, 85, 0.05)';
                        e.currentTarget.style.color = '#000000';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#5A5B55';
                      }
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.href === '/announcements' && (
                      <Badge 
                        className="ml-auto text-xs"
                        style={{ 
                          background: '#5A5B55', 
                          color: '#FBFBF1',
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '0.6rem'
                        }}
                      >
                        3
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile Quick Actions */}
              <div 
                className="pt-3 border-t mt-3"
                style={{ borderTopColor: '#5A5B55' }}
              >
                <div 
                  className="text-sm font-medium px-3 pb-2"
                  style={{ 
                    color: '#5A5B55',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  Quick Actions
                </div>
                <Link
                  href="/clubs/create"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: '#5A5B55' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(90, 91, 85, 0.05)';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#5A5B55';
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Club</span>
                </Link>
                <Link
                  href="/clubs"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: '#5A5B55' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(90, 91, 85, 0.05)';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#5A5B55';
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="h-5 w-5" />
                  <span>Browse Clubs</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PortalNavbar;
