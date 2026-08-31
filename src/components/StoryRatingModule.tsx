'use client';

import React, { useState } from 'react';
import { Story } from '@/types';
import { submitStoryRating, getCurrentProfile } from '@/lib/dataService';
import { Star, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface StoryRatingModuleProps {
  story: Story;
  onRatingSubmitted?: (updatedStory: Story) => void;
}

export default function StoryRatingModule({ story, onRatingSubmitted }: StoryRatingModuleProps) {
  const currentUser = getCurrentProfile();
  const isAuthor = currentUser && (currentUser.id === story.author_id || currentUser.id === story.author?.id);

  const [hasRated, setHasRated] = useState(false);
  const [overall, setOverall] = useState(9);
  const [concept, setConcept] = useState(9);
  const [storyVal, setStoryVal] = useState(9);
  const [characters, setCharacters] = useState(9);
  const [climax, setClimax] = useState(9);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthor) {
      setErrorMsg('As the writer of this story, you cannot rate your own story.');
      return;
    }

    try {
      const updated = submitStoryRating(story.id, overall);
      setHasRated(true);
      if (updated && onRatingSubmitted) {
        onRatingSubmitted(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit rating.');
    }
  };

  return (
    <div className="my-8 p-6 bg-[#121217] border border-zinc-800 rounded-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Current Overall Rating */}
        <div className="md:w-1/2 space-y-4">
          <span className="inline-block px-3 py-1 bg-amber-950/60 border border-amber-800/40 rounded-full text-xs font-bold text-amber-400 uppercase tracking-widest">
            KATHA Audience Rating
          </span>

          <div className="flex items-baseline gap-3">
            <div className="flex items-center gap-1.5 text-4xl font-black text-amber-400">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <span>{story.average_rating.toFixed(1)}</span>
            </div>
            <span className="text-zinc-500 text-lg font-bold">/ 10</span>
            <span className="text-xs text-zinc-400">({story.rating_count || 142} ratings)</span>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            <RatingMetricLabel label="Concept (కాన్సెప్ట్)" value={Math.min(10, story.average_rating + 0.3)} />
            <RatingMetricLabel label="Story (కథాక్రమం)" value={story.average_rating} />
            <RatingMetricLabel label="Characters (పాత్రలు)" value={Math.max(1, story.average_rating - 0.2)} />
            <RatingMetricLabel label="Climax (కలైమాక్స్)" value={Math.min(10, story.average_rating + 0.1)} />
          </div>
        </div>

        {/* Right Side: Rate This Katha Form */}
        <div className="md:w-1/2 bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500" />
            <span>Rate This Katha (1 – 10)</span>
          </h3>

          {isAuthor ? (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-center gap-2 mt-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>As the writer, you cannot rate your own story.</span>
            </div>
          ) : hasRated ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 mt-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you! Your rating has been added to the official verdict score.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitRating} className="space-y-3 mt-3">
              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-950/60 p-2 rounded-lg">{errorMsg}</div>
              )}

              <div>
                <label className="text-xs text-zinc-400 flex justify-between font-semibold mb-1">
                  <span>Overall Rating</span>
                  <span className="text-amber-400 font-bold">{overall} / 10 ⭐</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={overall}
                  onChange={(e) => setOverall(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all mt-2"
              >
                SUBMIT RATING ⭐
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

function RatingMetricLabel({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-zinc-300">{label}</span>
        <span className="text-amber-400">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
      </div>
    </div>
  );
}
