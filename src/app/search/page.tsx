'use client';

import React, { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import { getStories } from '@/lib/dataService';
import { Story } from '@/types';
import { Search as SearchIcon, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Story[]>([]);

  useEffect(() => {
    setResults(getStories({ search: query }));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          SEARCH KATHALU
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Find Telugu movie stories by title, genre, author, or storyline keywords.
        </p>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search titles, genres, hero casting, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-red-500 rounded-2xl pl-12 pr-10 py-3.5 text-base text-white placeholder-zinc-500 focus:outline-none shadow-2xl transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-3.5 p-1 text-zinc-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3 font-semibold">
        <span>{results.length} stories found</span>
        {query && <span>Query: "{query}"</span>}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-2">
          <p className="text-base font-bold text-white">No stories matching your search</p>
          <p className="text-xs text-zinc-500">Try searching for keywords like 'Thriller', 'Nani', or 'Train'</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

    </div>
  );
}
