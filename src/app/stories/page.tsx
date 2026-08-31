'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import { getStories, syncStoriesFromSupabase } from '@/lib/dataService';
import { Story, Genre } from '@/types';
import { Compass, Filter, ArrowUpDown, PenSquare, Film } from 'lucide-react';

const GENRES: (Genre | 'All')[] = [
  'All',
  'Action',
  'Thriller',
  'Romance',
  'Drama',
  'Comedy',
  'Horror',
  'Sci-Fi',
  'Crime',
  'Fantasy',
];

const SORT_OPTIONS = [
  'Trending',
  'Newest',
  'Most Read',
  'Highest Rated',
  'Most Discussed',
];

function StoriesContent() {
  const searchParams = useSearchParams();
  const initialSort = searchParams.get('sort') || 'Trending';
  const initialGenre = searchParams.get('genre') || 'All';

  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    setStories(getStories({ genre: selectedGenre, sortBy: selectedSort }));

    syncStoriesFromSupabase().then(() => {
      setStories(getStories({ genre: selectedGenre, sortBy: selectedSort }));
    });
  }, [selectedGenre, selectedSort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-7 h-7 text-red-500" />
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            DISCOVER KATHALU
          </h1>
        </div>
        <p className="text-sm text-zinc-400 font-sans">
          Explore original Telugu movie story ideas by real writers. Read, vote, rate and cast your favorite stars!
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0 hidden sm:block" />
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedGenre === g
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
          <ArrowUpDown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase">Sort:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-red-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="p-12 sm:p-16 bg-gradient-to-b from-[#14141A] to-[#0D0D12] border border-zinc-800/80 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="inline-flex p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Film className="w-10 h-10 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              🎬 The screen is empty.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
              Your Katha could be the first. Publish an original Telugu movie concept on KATHA!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-lg shadow-red-950/60 hover:scale-105 transition-all"
            >
              <PenSquare className="w-4 h-4" />
              <span>✍️ WRITE YOUR STORY</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-zinc-400">Loading stories...</div>}>
      <StoriesContent />
    </Suspense>
  );
}
