'use client';

import React, { useState, useEffect } from 'react';
import { submitWouldWatchVote, getWouldWatchStats } from '@/lib/dataService';
import confetti from 'canvas-confetti';
import { Flame, Skull, Share2, CheckCircle2 } from 'lucide-react';
import ShareVerdictModal from './ShareVerdictModal';
import { Story } from '@/types';

interface WouldWatchModuleProps {
  story: Story;
}

export default function WouldWatchModule({ story }: WouldWatchModuleProps) {
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [yesPercent, setYesPercent] = useState<number>(87);
  const [noPercent, setNoPercent] = useState<number>(13);
  const [totalVotes, setTotalVotes] = useState<number>(100);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const state = getWouldWatchStats(story.id);
    setUserVote(state.userVote);
    setYesPercent(state.yesPercent);
    setNoPercent(state.noPercent);
    setTotalVotes(state.totalVotes);
  }, [story.id]);

  const handleVote = (vote: 'yes' | 'no') => {
    setErrorMsg('');
    try {
      if (vote === 'yes') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#E50914', '#FF4500', '#FFB800'],
          });
        } catch (e) {}
      }

      const res = submitWouldWatchVote(story.id, vote);
      setUserVote(vote);
      setYesPercent(res.yesPercent);
      setNoPercent(res.noPercent);
      setTotalVotes(res.totalVotes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication required to vote.');
    }
  };

  return (
    <div className="my-10 p-6 sm:p-8 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 border-red-900/40 rounded-3xl shadow-2xl relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-red-950/80 border border-red-800/60 rounded-full text-xs font-bold text-red-400 uppercase tracking-widest">
          TFI Audience Verdict
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
          <span>🎬 WOULD YOU WATCH THIS AS A MOVIE?</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans">
          ఇది థియేటర్‌లో లేదా OTTలో వస్తే మీరు చూస్తారా? మీ తీర్పు చెప్పండి.
        </p>

        {errorMsg && (
          <div className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl border border-red-800/60">
            {errorMsg}
          </div>
        )}

        {!userVote ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleVote('yes')}
              className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-xl shadow-red-950/60 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Flame className="w-6 h-6 fill-amber-300 text-amber-300 group-hover:animate-bounce" />
              <span>YES, I'D WATCH 🔥</span>
            </button>

            <button
              onClick={() => handleVote('no')}
              className="group flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Skull className="w-6 h-6 text-zinc-400 group-hover:text-zinc-200" />
              <span>NO 💀</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>You voted: <strong>{userVote === 'yes' ? "YES, I'D WATCH 🔥" : 'NO 💀'}</strong></span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-orange-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  YES — {yesPercent}%
                </span>
                <span className="text-zinc-400 flex items-center gap-1">
                  NO — {noPercent}%
                </span>
              </div>

              <div className="w-full h-5 bg-zinc-900 rounded-full overflow-hidden p-0.5 flex border border-zinc-800">
                <div
                  style={{ width: `${yesPercent}%` }}
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 rounded-l-full transition-all duration-1000"
                />
                <div
                  style={{ width: `${noPercent}%` }}
                  className="h-full bg-zinc-800 rounded-r-full transition-all duration-1000"
                />
              </div>

              <p className="text-[11px] text-zinc-500 text-right">
                Based on {totalVotes.toLocaleString()} TFI fan votes
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-amber-400">
                You're part of the verdict 🔥
              </span>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE THIS VERDICT</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showShareModal && (
        <ShareVerdictModal
          story={story}
          yesPercent={yesPercent}
          rating={story.average_rating}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
