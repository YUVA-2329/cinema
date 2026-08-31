'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStories } from '@/lib/dataService';
import { Story } from '@/types';
import { Trophy, Flame, Star, Sparkles, ArrowUpRight, PenSquare } from 'lucide-react';

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<{ rank: number; story: Story; score: number }[]>([]);

  useEffect(() => {
    const stories = getStories({ sortBy: 'Trending' });
    const now = new Date().getTime();
    
    const ranked = stories.map((story) => {
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

    setRankings(
      ranked.map((item, idx) => ({
        rank: idx + 1,
        story: item.story,
        score: item.score,
      }))
    );
  }, []);

  const top3 = rankings.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/40 mb-2">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          🏆 STORY OF THE WEEK
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
          The official weekly Tollywood story rankings calculated via weighted engagement algorithm (Reads × 1 + Likes × 4 + Would Watch % × 5 + Rating × 10).
        </p>
      </div>

      {rankings.length === 0 ? (
        <div className="p-12 sm:p-16 bg-gradient-to-b from-[#16161D] via-zinc-950 to-black border-2 border-amber-900/40 rounded-3xl text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex p-4 rounded-2xl bg-amber-950/40 border border-amber-900/50 text-amber-400 relative z-10">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              🏆 The first Story of the Week is waiting.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
              Publish your Katha, build your fan reputation, and take the top spot.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm px-7 py-3.5 rounded-full shadow-xl shadow-amber-950/60 hover:scale-105 transition-all"
            >
              <PenSquare className="w-4 h-4" />
              <span>✍️ WRITE YOUR STORY</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM DISPLAY */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* 2ND PLACE (SILVER) */}
              <div className="order-2 md:order-1 bg-zinc-950 border-2 border-slate-400/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-3xl font-black opacity-80">🥈</div>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    #2 STORY OF THE WEEK
                  </span>
                  <img
                    src={top3[1].story.cover_image_url}
                    alt={top3[1].story.title}
                    className="w-full h-40 object-cover rounded-2xl border border-zinc-800"
                  />
                  <div>
                    <Link
                      href={`/story/${top3[1].story.slug || top3[1].story.id}`}
                      className="text-lg font-black text-white hover:text-slate-300 transition-colors line-clamp-1"
                    >
                      {top3[1].story.title}
                    </Link>
                    <p className="text-xs text-zinc-400">@{top3[1].story.author.username} • {top3[1].story.genre}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {top3[1].story.average_rating}
                  </span>
                  <span className="text-slate-300 font-mono">{top3[1].score.toLocaleString()} PTS</span>
                </div>
              </div>

              {/* 1ST PLACE (GOLD - FEATURED ELEVATED) */}
              <div className="order-1 md:order-2 bg-gradient-to-b from-[#1C1A12] via-zinc-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-amber-950/40 relative overflow-hidden md:-translate-y-4">
                <div className="absolute top-3 right-3 text-4xl font-black animate-pulse">🥇</div>
                
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    <Sparkles className="w-3 h-3 fill-black" />
                    <span>WEEKLY CHAMPION #1</span>
                  </div>
                  <img
                    src={top3[0].story.cover_image_url}
                    alt={top3[0].story.title}
                    className="w-full h-48 object-cover rounded-2xl border-2 border-amber-500/50 shadow-xl"
                  />
                  <div>
                    <Link
                      href={`/story/${top3[0].story.slug || top3[0].story.id}`}
                      className="text-xl sm:text-2xl font-black text-white hover:text-amber-400 transition-colors line-clamp-1"
                    >
                      {top3[0].story.title}
                    </Link>
                    <p className="text-xs text-amber-300 font-semibold">@{top3[0].story.author.username} • {top3[0].story.genre}</p>
                  </div>
                  <p className="text-xs text-zinc-300 italic line-clamp-2">
                    "{top3[0].story.pitch}"
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-900/40 flex items-center justify-between text-xs font-extrabold">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 flex items-center gap-1">
                      <Flame className="w-4 h-4 fill-orange-400" />
                      {Math.round((top3[0].story.would_watch_yes / (top3[0].story.would_watch_yes + top3[0].story.would_watch_no || 1)) * 100)}% Watch
                    </span>
                  </div>
                  <span className="text-amber-400 font-mono text-sm">{top3[0].score.toLocaleString()} PTS</span>
                </div>
              </div>

              {/* 3RD PLACE (BRONZE) */}
              <div className="order-3 bg-zinc-950 border-2 border-amber-800/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-3xl font-black opacity-80">🥉</div>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
                    #3 STORY OF THE WEEK
                  </span>
                  <img
                    src={top3[2].story.cover_image_url}
                    alt={top3[2].story.title}
                    className="w-full h-40 object-cover rounded-2xl border border-zinc-800"
                  />
                  <div>
                    <Link
                      href={`/story/${top3[2].story.slug || top3[2].story.id}`}
                      className="text-lg font-black text-white hover:text-amber-400 transition-colors line-clamp-1"
                    >
                      {top3[2].story.title}
                    </Link>
                    <p className="text-xs text-zinc-400">@{top3[2].story.author.username} • {top3[2].story.genre}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {top3[2].story.average_rating}
                  </span>
                  <span className="text-amber-500 font-mono">{top3[2].score.toLocaleString()} PTS</span>
                </div>
              </div>

            </div>
          )}

          {/* FULL LEADERBOARD TABLE */}
          <div className="p-6 bg-[#121217] border border-zinc-800 rounded-3xl space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Full Leaderboard Standings</span>
            </h3>

            <div className="space-y-2">
              {rankings.map((item) => {
                const totalVotes = item.story.would_watch_yes + item.story.would_watch_no;
                const watchPct = totalVotes > 0 ? Math.round((item.story.would_watch_yes / totalVotes) * 100) : 85;

                return (
                  <div
                    key={item.story.id}
                    className="flex items-center justify-between p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-lg font-extrabold w-8 text-zinc-400 text-center shrink-0">
                        #{item.rank}
                      </span>
                      <img
                        src={item.story.cover_image_url}
                        alt={item.story.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/story/${item.story.slug || item.story.id}`}
                          className="text-sm font-bold text-white hover:text-red-400 transition-colors truncate block flex items-center gap-1"
                        >
                          <span>{item.story.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                        </Link>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.story.genre} • @{item.story.author.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-orange-400">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        <span>{watchPct}%</span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.story.average_rating}</span>
                      </div>

                      <div className="text-zinc-300 font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                        {item.score.toLocaleString()} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
