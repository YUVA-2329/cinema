'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, PenSquare, Trophy, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Trending', href: '/stories?sort=Trending', icon: Flame },
    { label: 'Write', href: '/write', icon: PenSquare, highlight: true },
    { label: 'Rankings', href: '/leaderboard', icon: Trophy },
    {
      label: 'Profile',
      href: profile ? `/u/${profile.username}` : '/login',
      icon: User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 text-white p-3.5 rounded-full shadow-lg shadow-red-950/60 ring-4 ring-[#0A0A0C] transition-transform active:scale-95"
              >
                <Icon className="w-6 h-6 stroke-[2.5]" />
                <span className="sr-only">Write Story</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                isActive ? 'text-red-500 scale-105' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
