'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStories, deleteStory, updateStoryStatus } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';
import { Story } from '@/types';
import { PenSquare, BookOpen, Eye, Heart, Star, Flame, Sparkles, FileText, Trash2, Globe, Lock, Plus, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      loadStories(profile.id);
    }
  }, [user, profile, authLoading, router]);

  const loadStories = (userId: string) => {
    const all = getStories({ authorId: userId, publishedOnly: false });
    setStories(all);
  };

  const handleDelete = (storyId: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      deleteStory(storyId);
      if (profile) loadStories(profile.id);
    }
  };

  const handleToggleVisibility = (storyId: string, currentVisibility?: 'private' | 'public') => {
    const nextVis = currentVisibility === 'public' ? 'private' : 'public';
    updateStoryStatus(storyId, nextVis === 'public', nextVis);
    if (profile) loadStories(profile.id);
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Loading your author dashboard...</p>
      </div>
    );
  }

  if (!profile) return null;

  const publicStories = stories.filter((s) => s.visibility === 'public');
  const privateStoriesCount = stories.filter((s) => s.visibility !== 'public').length;
  const totalReads = stories.reduce((sum, s) => sum + s.views, 0);
  const totalLikes = stories.reduce((sum, s) => sum + s.likes_count, 0);
  const avgRating = stories.length > 0
    ? Number((stories.reduce((sum, s) => sum + s.average_rating, 0) / stories.length).toFixed(1))
    : 0;
  const totalYes = stories.reduce((sum, s) => sum + s.would_watch_yes, 0);
  const totalNo = stories.reduce((sum, s) => sum + s.would_watch_no, 0);
  const overallWouldWatch = totalYes + totalNo > 0 ? Math.round((totalYes / (totalYes + totalNo)) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
            Author Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-2">
            YOUR KATHA PORTFOLIO
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Welcome back, @{profile.username}! Private stories are visible only to you.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/drafts"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs px-4 py-2.5 rounded-full transition-colors"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Private Stories ({privateStoriesCount})</span>
          </Link>

          <Link
            href="/write"
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-red-950/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>WRITE NEW KATHA</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
            <BookOpen className="w-5 h-5 text-red-500" />
            <span>{publicStories.length}</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Public</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
            <Eye className="w-5 h-5 text-amber-400" />
            <span>{totalReads.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Total Reads</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
            <Heart className="w-5 h-5 text-red-400" />
            <span>{totalLikes.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Total Likes</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{avgRating}</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Avg Rating</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-400" />
            <span>{overallWouldWatch}%</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Would Watch</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-950/60 to-zinc-950 border border-amber-800/60 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-5 h-5 fill-amber-400" />
            <span>{profile.katha_score}</span>
          </div>
          <div className="text-[10px] font-bold text-amber-300 uppercase">Katha Score</div>
        </div>

      </div>

      {/* YOUR STORIES LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <PenSquare className="w-5 h-5 text-red-500" />
          <span>YOUR STORIES ({stories.length})</span>
        </h2>

        {stories.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-3xl space-y-3">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No stories written yet</h3>
            <p className="text-xs text-zinc-400">Share your first Tollywood movie concept on KATHA today! Default visibility is Private.</p>
            <Link
              href="/write"
              className="inline-block bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-full"
            >
              Write First Story
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => {
              const totalVotes = story.would_watch_yes + story.would_watch_no;
              const watchPct = totalVotes > 0 ? Math.round((story.would_watch_yes / totalVotes) * 100) : 0;
              const isPublic = story.visibility === 'public';

              return (
                <div
                  key={story.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl gap-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                          isPublic ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold">{story.genre}</span>
                      </div>
                      <Link
                        href={`/story/${story.slug}`}
                        className="text-base font-bold text-white hover:text-red-400 transition-colors truncate block"
                      >
                        {story.title}
                      </Link>
                      <p className="text-xs text-zinc-400 line-clamp-1 italic font-sans mt-0.5">
                        "{story.pitch}"
                      </p>
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 text-xs font-semibold shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        <span>{watchPct}% Watch</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{story.average_rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{story.views}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/story/${story.slug}`}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => handleToggleVisibility(story.id, story.visibility)}
                        title={isPublic ? 'Make Private' : 'Make Public'}
                        className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 transition-colors text-xs font-bold"
                      >
                        {isPublic ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Make Private</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Make Public</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(story.id)}
                        title="Delete story"
                        className="p-1.5 bg-zinc-900 hover:bg-red-950 text-red-400 rounded-lg border border-zinc-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
