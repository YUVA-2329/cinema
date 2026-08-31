'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import { getStories, syncStoriesFromSupabase } from '@/lib/dataService';
import { Story } from '@/types';
import { PenSquare, Flame, Sparkles, Trophy, ArrowRight, Film, Star, Eye } from 'lucide-react';

export default function HomePage() {
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);
  const [hotStories, setHotStories] = useState<Story[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ rank: number; story: Story; score: number }[]>([]);

  const loadAllStories = (all: Story[]) => {
    setTrendingStories(all.slice(0, 3));
    
    const newest = getStories({ sortBy: 'Newest' });
    setNewStories(newest.slice(0, 4));

    const hot = getStories({ sortBy: 'Most Discussed' });
    setHotStories(hot.slice(0, 3));

    const now = new Date().getTime();
    const ranked = all.map((story) => {
      const totalVotes = story.would_watch_yes + story.would_watch_no;
      const watchPct = totalVotes > 0 ? (story.would_watch_yes / totalVotes) * 100 : 85;
      const daysOld = Math.max(1, (now - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      const score = Math.round(
        story.views * 1 +
        story.likes_count * 4 +
        watchPct * 5 +
        story.average_rating * 10 -
        daysOld * 2
      );
      return { story, score };
    });

    ranked.sort((a, b) => b.score - a.score);

    setLeaderboard(
      ranked.slice(0, 5).map((item, idx) => ({
        rank: idx + 1,
        story: item.story,
        score: item.score,
      }))
    );
  };

  useEffect(() => {
    // Initial fetch from backend
    const loadData = async () => {
      const { fetchStoriesAsync } = await import('@/lib/dataService');
      const stories = await fetchStoriesAsync({ sortBy: 'Trending' });
      loadAllStories(stories);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16">
      
      {/* 1. CINEMATIC LANDING HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-12 pb-16 px-4 overflow-hidden border-b border-zinc-800/80">
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/20 via-orange-600/15 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 film-grain opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/80 border border-red-800/50 px-4 py-1.5 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <Film className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-sans">
              Tollywood Cinema Story Platform
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase font-sans drop-shadow-2xl">
              KATHA
            </h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 font-sans tracking-wide">
              నీ కథ. మన తీర్పు.
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-2 text-zinc-300 text-base sm:text-lg font-sans leading-relaxed">
            <p className="font-semibold text-white">
              “Have a movie story hiding in your head?”
            </p>
            <p className="text-zinc-400 text-sm sm:text-base">
              Write it. Publish it. Let TFI fans decide whether they'd watch it as a movie.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/write"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-red-950/60 hover:scale-105 active:scale-95 transition-all"
            >
              <PenSquare className="w-5 h-5" />
              <span>✍️ WRITE YOUR STORY</span>
            </Link>

            <Link
              href="/stories"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/90 text-zinc-200 hover:text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span>🔥 EXPLORE STORIES</span>
            </Link>
          </div>

          <div className="pt-8 border-t border-zinc-800/60 grid grid-cols-3 max-w-lg mx-auto text-center gap-2">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">100%</div>
              <div className="text-[11px] text-zinc-500 uppercase font-semibold">Real Writers</div>
            </div>
            <div className="border-x border-zinc-800">
              <div className="text-xl sm:text-2xl font-black text-amber-400">87%+</div>
              <div className="text-[11px] text-zinc-500 uppercase font-semibold">Would Watch</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-red-500">TFI</div>
              <div className="text-[11px] text-zinc-500 uppercase font-semibold">Fan Voting</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. 🔥 TRENDING STORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500 fill-red-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                TRENDING STORIES
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Top Tollywood concept pitches making waves right now.
            </p>
          </div>

          {trendingStories.length > 0 && (
            <Link
              href="/stories?sort=Trending"
              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {trendingStories.length === 0 ? (
          <div className="p-10 sm:p-14 bg-gradient-to-b from-[#14141A] to-[#0D0D12] border border-zinc-800/80 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="inline-flex p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-500">
              <Flame className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                🔥 Nothing is trending yet.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
                Be the first story to make some noise. Publish your movie concept and get judged by TFI fans!
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
          <div className="space-y-6">
            <StoryCard story={trendingStories[0]} featured={true} />
            {trendingStories.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingStories.slice(1, 3).map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. 🏆 TOP THIS WEEK LEADERBOARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#16161D] via-zinc-950 to-black border border-amber-900/40 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  TOP THIS WEEK
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Story of the Week Leaderboard based on real TFI fan reads, likes & Would Watch votes.
              </p>
            </div>

            {leaderboard.length > 0 && (
              <Link
                href="/leaderboard"
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg transition-all"
              >
                FULL LEADERBOARD 🏆
              </Link>
            )}
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 sm:p-12 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-center space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-amber-950/40 border border-amber-900/50 text-amber-400">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  🏆 The first Story of the Week is waiting.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
                  Publish your Katha, build your fan reputation, and take the top spot.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/write"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-3 rounded-full shadow-lg transition-all"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>✍️ WRITE YOUR STORY</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((item) => {
                const totalVotes = item.story.would_watch_yes + item.story.would_watch_no;
                const watchPct = totalVotes > 0 ? Math.round((item.story.would_watch_yes / totalVotes) * 100) : 85;
                const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;

                return (
                  <div
                    key={item.story.id}
                    className="flex items-center justify-between p-4 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xl sm:text-2xl font-extrabold w-8 text-center shrink-0">
                        {medal}
                      </span>
                      <img
                        src={item.story.cover_image_url}
                        alt={item.story.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/story/${item.story.slug || item.story.id}`}
                          className="text-base font-bold text-white hover:text-amber-400 transition-colors truncate block"
                        >
                          {item.story.title}
                        </Link>
                        <p className="text-xs text-zinc-400 truncate">
                          {item.story.genre} • @{item.story.author.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-800/40">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        <span>{watchPct}%</span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.story.average_rating}</span>
                      </div>

                      <div className="hidden md:flex items-center gap-1 text-zinc-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.story.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 4. 🆕 NEW STORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                NEW STORIES
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Freshly published Telugu movie concepts by rising writers.
            </p>
          </div>

          {newStories.length > 0 && (
            <Link
              href="/stories?sort=Newest"
              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {newStories.length === 0 ? (
          <div className="p-10 sm:p-14 bg-gradient-to-b from-[#14141A] to-[#0D0D12] border border-zinc-800/80 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="inline-flex p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Film className="w-8 h-8 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                🎬 The screen is empty.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
                Your Katha could be the first. Share your story concept with Tollywood cinema fans today.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>

      {/* 5. 🔥 HOT STORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                HOT STORIES (LAST 24 HOURS)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Stories generating high engagement, comments & fan casting votes today.
            </p>
          </div>
        </div>

        {hotStories.length === 0 ? (
          <div className="p-10 sm:p-14 bg-gradient-to-b from-[#14141A] to-[#0D0D12] border border-zinc-800/80 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="inline-flex p-4 rounded-2xl bg-orange-950/40 border border-orange-900/50 text-orange-500">
              <Flame className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                🔥 Nothing is trending yet.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
                Be the first story to make some noise.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/write"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
              >
                <PenSquare className="w-4 h-4" />
                <span>✍️ WRITE YOUR STORY</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
