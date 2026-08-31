'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationRead } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';
import { NotificationItem } from '@/types';
import { Bell, MessageSquare, Heart, Trophy, Sparkles, Check, ArrowRight, Loader2, Video } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      loadNotifs(profile.id);
    }
  }, [user, profile, authLoading, router]);

  const loadNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Loading notifications...</p>
      </div>
    );
  }

  if (!profile) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-5 h-5 text-red-400" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'milestone':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'leaderboard':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'call_request':
        return <Video className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-800/60 rounded-2xl text-red-500">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              NOTIFICATIONS
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Reader engagement, comments & milestone alerts.
            </p>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-3xl space-y-2">
          <Bell className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No notifications yet</h3>
          <p className="text-xs text-zinc-500">When readers vote, comment or rate your stories, alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                notif.is_read
                  ? 'bg-zinc-950/60 border-zinc-800/60 opacity-70'
                  : 'bg-zinc-950 border-zinc-800 shadow-md'
              }`}
            >
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">{notif.message}</p>

                {notif.link && (
                  <div className="pt-2">
                    <Link
                      href={notif.link}
                      onClick={() => handleMarkRead(notif.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                    >
                      <span>View Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  title="Mark as read"
                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
