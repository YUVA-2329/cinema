'use client';

import React from 'react';
import { Achievement } from '@/types';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
}

export default function AchievementBadge({ achievement, unlocked = true }: AchievementBadgeProps) {
  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#181820] border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-400'
          : 'bg-zinc-950 border-zinc-800/60 opacity-40 grayscale'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl p-2.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 shrink-0">
          {achievement.icon}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-extrabold text-white tracking-wide">{achievement.name}</h4>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}
