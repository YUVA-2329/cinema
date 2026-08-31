'use client';

import React from 'react';
import Link from 'next/link';
import { Story } from '@/types';
import { Star, Flame, Eye, ArrowRight, Sparkles, Lock } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: StoryCardProps) {
  const totalVotes = story.would_watch_yes + story.would_watch_no;
  const watchPercent = totalVotes > 0 ? Math.round((story.would_watch_yes / totalVotes) * 100) : 87;

  return (
    <div
      className={`group relative flex flex-col bg-[#121217] border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/90 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1 ${
        featured ? 'md:flex-row md:items-stretch' : ''
      }`}
    >
      {/* Featured Badge Overlay */}
      {story.is_featured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3" />
          <span>Featured Katha</span>
        </div>
      )}

      {/* Private Indicator Badge (Requirement UI: Add a small Private indicator to private stories) */}
      {story.visibility === 'private' && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md text-amber-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-800/60 shadow-lg">
          <Lock className="w-3 h-3" />
          <span>Private</span>
        </div>
      )}

      {/* Cover Image Container */}
      <div
        className={`relative overflow-hidden bg-zinc-900 ${
          featured ? 'w-full md:w-5/12 h-64 md:h-auto min-h-[220px]' : 'w-full h-52'
        }`}
      >
        <img
          src={story.cover_image_url}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-black/30" />

        {/* Genre Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-zinc-950/80 backdrop-blur-md text-zinc-200 text-xs font-semibold px-3 py-1 rounded-full border border-zinc-700/60 uppercase tracking-wider">
            {story.genre}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className={`p-5 flex-1 flex flex-col justify-between ${featured ? 'md:p-6 md:w-7/12' : ''}`}>
        <div>
          {/* Author info */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={story.author.avatar_url}
              alt={story.author.display_name}
              className="w-5 h-5 rounded-full object-cover border border-zinc-700"
            />
            <span className="text-xs font-medium text-zinc-400">
              @{story.author.username}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-white group-hover:text-red-400 transition-colors line-clamp-1 tracking-tight">
            {story.title}
          </h3>

          {/* One-Line Pitch */}
          <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-2 line-clamp-2 leading-relaxed">
            "{story.pitch}"
          </p>
        </div>

        {/* Stats Row & CTA */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 font-semibold">
            {/* Would Watch % */}
            <div className="flex items-center gap-1 text-orange-400 bg-orange-950/50 px-2.5 py-1 rounded-lg border border-orange-800/40">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{watchPercent}% Watch</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{story.average_rating}</span>
            </div>

            {/* Views */}
            <div className="hidden sm:flex items-center gap-1 text-zinc-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{story.views.toLocaleString()}</span>
            </div>
          </div>

          {/* Read Story Button */}
          <Link
            href={`/story/${story.slug || story.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all"
          >
            <span>READ STORY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
