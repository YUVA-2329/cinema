'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStories, updateStoryStatus, deleteStory } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';
import { Story } from '@/types';
import { FileText, Globe, Trash2, ArrowLeft, Plus, Loader2 } from 'lucide-react';

export default function DraftsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState<Story[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      loadDrafts(profile.id);
    }
  }, [user, profile, authLoading, router]);

  const loadDrafts = (userId: string) => {
    const all = getStories({ authorId: userId, publishedOnly: false });
    setDrafts(all.filter((s) => !s.published));
  };

  const handlePublish = (storyId: string) => {
    updateStoryStatus(storyId, true);
    if (profile) loadDrafts(profile.id);
  };

  const handleDelete = (storyId: string) => {
    if (confirm('Delete this draft permanently?')) {
      deleteStory(storyId);
      if (profile) loadDrafts(profile.id);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Loading your drafts...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO DASHBOARD</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              UNPUBLISHED DRAFTS
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Private story drafts. Only visible to you.
          </p>
        </div>

        <Link
          href="/write"
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW DRAFT</span>
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-3xl space-y-3">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No drafts saved</h3>
          <p className="text-xs text-zinc-400">Save unfinished story concepts as draft anytime from the writer editor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-zinc-950 border border-zinc-800 rounded-2xl gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={draft.cover_image_url}
                  alt={draft.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800">
                    Draft • {draft.genre}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 truncate">{draft.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 italic font-sans">{draft.pitch}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <button
                  onClick={() => handlePublish(draft.id)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Publish Story 🔥</span>
                </button>

                <button
                  onClick={() => handleDelete(draft.id)}
                  className="p-2 bg-zinc-900 hover:bg-red-950 text-red-400 rounded-xl border border-zinc-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
