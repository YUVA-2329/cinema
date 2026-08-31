'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import KathaLogo from './KathaLogo';
import { Search, PenSquare, Trophy, Flame, Compass, Home, User, LogOut, ShieldCheck, Sparkles, Bell, LayoutDashboard, FileText, Loader2 } from 'lucide-react';
import { getNotifications } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthenticated = Boolean(user || profile);

  const activeProfile: Profile | null = profile || (user ? {
    id: user.id,
    user_id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || `writer_${user.id.substring(0, 5)}`,
    display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Katha Storyteller',
    avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: 'TFI Movie Storyteller on KATHA',
    katha_score: 100,
    created_at: new Date().toISOString(),
  } : null);

  useEffect(() => {
    if (activeProfile) {
      const notifs = getNotifications(activeProfile.id);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    } else {
      setUnreadCount(0);
    }
  }, [pathname, activeProfile]);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await signOut();
  };

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Stories', href: '/stories', icon: Compass },
    { label: 'Trending', href: '/stories?sort=Trending', icon: Flame },
    { label: 'Rankings', href: '/leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0C]/90 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <KathaLogo size="md" showTagline={true} />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-full border border-zinc-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Search Link */}
          <Link
            href="/search"
            aria-label="Search stories"
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Notifications Link */}
          {isAuthenticated && activeProfile && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0A0A0C] animate-pulse" />
              )}
            </Link>
          )}

          {/* Write Story CTA */}
          <Link
            href="/write"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-semibold text-sm px-4 py-2 rounded-full shadow-lg shadow-red-950/40 hover:shadow-red-600/30 hover:scale-[1.02] transition-all"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Story</span>
          </Link>

          {/* User Profile / Auth State Loading / Login Button */}
          {loading ? (
            <div className="p-2 text-zinc-500 animate-spin">
              <Loader2 className="w-5 h-5" />
            </div>
          ) : isAuthenticated && activeProfile ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all focus:outline-none"
              >
                <img
                  src={activeProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                  alt={activeProfile.display_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500/50"
                />
                <span className="hidden lg:flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/50">
                  <Sparkles className="w-3 h-3" />
                  {activeProfile.katha_score}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-200">
                  <div className="px-4 py-2.5 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-white truncate">{activeProfile.display_name}</p>
                    <p className="text-xs text-zinc-400 truncate">@{activeProfile.username}</p>
                  </div>

                  <Link
                    href={`/u/${activeProfile.username}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-400" />
                    <span>Author Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard/drafts"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>My Drafts</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Moderator Dashboard</span>
                  </Link>

                  <div className="border-t border-zinc-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-block text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-full transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
