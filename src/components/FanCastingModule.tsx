'use client';

import React, { useState, useEffect } from 'react';
import { Story } from '@/types';
import { submitCastingVote, getStoryBySlugOrId } from '@/lib/dataService';
import { UserCheck, Clapperboard, Check } from 'lucide-react';

interface FanCastingModuleProps {
  story: Story;
}

const HERO_OPTIONS = [
  'Nani',
  'Jr NTR',
  'Prabhas',
  'Allu Arjun',
  'Mahesh Babu',
  'Ram Charan',
  'Vijay Deverakonda',
  'Adivi Sesh',
  'Naga Chaitanya',
];

const DIRECTOR_OPTIONS = [
  'S.S. Rajamouli',
  'Sukumar',
  'Trivikram Srinivas',
  'Prashanth Neel',
  'Sandeep Reddy Vanga',
  'Koratala Siva',
];

export default function FanCastingModule({ story }: FanCastingModuleProps) {
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [heroStats, setHeroStats] = useState<{ candidate: string; percentage: number }[]>([]);
  const [directorStats, setDirectorStats] = useState<{ candidate: string; percentage: number }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    calculateStats();
  }, [story.id, selectedHero, selectedDirector]);

  const calculateStats = () => {
    const s = getStoryBySlugOrId(story.id) || story;
    
    // Hero stats
    const heroMap = s.hero_casting || {};
    const heroTotal = Object.values(heroMap).reduce((sum, v) => sum + v, 0);
    if (heroTotal > 0) {
      const hList = Object.entries(heroMap)
        .map(([candidate, count]) => ({ candidate, percentage: Math.round((count / heroTotal) * 100) }))
        .sort((a, b) => b.percentage - a.percentage);
      setHeroStats(hList);
    } else {
      setHeroStats([]);
    }

    // Director stats
    const dirMap = s.director_casting || {};
    const dirTotal = Object.values(dirMap).reduce((sum, v) => sum + v, 0);
    if (dirTotal > 0) {
      const dList = Object.entries(dirMap)
        .map(([candidate, count]) => ({ candidate, percentage: Math.round((count / dirTotal) * 100) }))
        .sort((a, b) => b.percentage - a.percentage);
      setDirectorStats(dList);
    } else {
      setDirectorStats([]);
    }
  };

  const handleHeroVote = (actor: string) => {
    setErrorMsg('');
    try {
      submitCastingVote(story.id, 'hero', actor);
      setSelectedHero(actor);
    } catch (err: any) {
      setErrorMsg(err.message || 'Please log in to cast votes.');
    }
  };

  const handleDirectorVote = (dir: string) => {
    setErrorMsg('');
    try {
      submitCastingVote(story.id, 'director', dir);
      setSelectedDirector(dir);
    } catch (err: any) {
      setErrorMsg(err.message || 'Please log in to cast votes.');
    }
  };

  return (
    <div className="my-10 p-6 sm:p-8 bg-[#121217] border border-zinc-800 rounded-3xl space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50">
            Fan Casting
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
            <span>🎭 CAST YOUR VERSION</span>
          </h2>
          <p className="text-xs text-zinc-400">
            (Community Fan Voting — Fictional fan poll options only. No official involvement)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl border border-red-800/60">
          {errorMsg}
        </div>
      )}

      {/* 1. HERO CASTING */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-red-500" />
          <span>WHO SHOULD PLAY THE HERO?</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {HERO_OPTIONS.map((actor) => {
            const isSelected = selectedHero === actor;
            return (
              <button
                key={actor}
                onClick={() => handleHeroVote(actor)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/60'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{actor}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="mt-4 p-4 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Current Fan Verdict for Hero:
          </h4>
          {heroStats.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No fan votes cast yet. Be the first to vote!</p>
          ) : (
            heroStats.slice(0, 4).map((stat) => (
              <div key={stat.candidate} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{stat.candidate}</span>
                  <span className="text-orange-400 font-bold">{stat.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stat.percentage}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. DIRECTOR CASTING */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-amber-500" />
          <span>WHO SHOULD DIRECT THIS?</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
          {DIRECTOR_OPTIONS.map((dir) => {
            const isSelected = selectedDirector === dir;
            return (
              <button
                key={dir}
                onClick={() => handleDirectorVote(dir)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-950/60'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{dir}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="mt-4 p-4 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Current Fan Verdict for Director:
          </h4>
          {directorStats.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No fan votes cast yet. Be the first to vote!</p>
          ) : (
            directorStats.slice(0, 4).map((stat) => (
              <div key={stat.candidate} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{stat.candidate}</span>
                  <span className="text-amber-400 font-bold">{stat.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stat.percentage}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
