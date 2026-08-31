'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoryBySlugOrId, syncStoriesFromSupabase, recordStoryView, toggleStoryLike, getStoryLikeState, getCurrentProfile } from '@/lib/dataService';
import { Story } from '@/types';
import WouldWatchModule from '@/components/WouldWatchModule';
import StoryRatingModule from '@/components/StoryRatingModule';
import FanCastingModule from '@/components/FanCastingModule';
import CommentsSection from '@/components/CommentsSection';
import ShareVerdictModal from '@/components/ShareVerdictModal';
import ReportModal from '@/components/ReportModal';
import CallModal from '@/components/CallModal';
import { Star, Flame, Eye, Share2, ShieldAlert, ArrowLeft, Heart, Sparkles, Loader2, Lock, Video } from 'lucide-react';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    const currentP = getCurrentProfile();
    const s = getStoryBySlugOrId(slug, currentP?.id);

    if (s) {
      setStory(s);
      setLikesCount(s.likes_count);
      setIsLiked(getStoryLikeState(s.id));
      recordStoryView(s.id);
      setLoading(false);
    } else {
      syncStoriesFromSupabase().then(() => {
        const found = getStoryBySlugOrId(slug, currentP?.id);
        if (found) {
          setStory(found);
          setLikesCount(found.likes_count);
          setIsLiked(getStoryLikeState(found.id));
          recordStoryView(found.id);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Verifying story permissions...</p>
      </div>
    );
  }

  // Security Enforcement: Direct URL access blocking for private stories
  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800/40 w-16 h-16 mx-auto flex items-center justify-center text-red-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Private Story Access Denied</h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          This Katha is marked as private by its writer and cannot be accessed by other users.
        </p>
        <div className="pt-2">
          <Link href="/stories" className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-3 rounded-full transition-all">
            EXPLORE PUBLIC STORIES
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes = story.would_watch_yes + story.would_watch_no;
  const watchPercent = totalVotes > 0 ? Math.round((story.would_watch_yes / totalVotes) * 100) : 87;

  const handleToggleLike = () => {
    try {
      const res = toggleStoryLike(story.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.newCount);
    } catch (err: any) {
      alert(err.message || 'Please log in to like stories.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO STORIES</span>
      </button>

      {/* Hero Movie Style Cover Banner */}
      <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <img
          src={story.cover_image_url}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {story.genre}
            </span>

            {story.visibility === 'private' && (
              <span className="bg-amber-950/90 text-amber-400 border border-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Private Story</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCallModal(true)}
              className="flex items-center gap-1.5 bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Connect with Creator</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md hover:bg-zinc-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-full border border-zinc-700/80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              aria-label="Report story"
              className="p-1.5 bg-zinc-950/80 backdrop-blur-md hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-full border border-zinc-700/80 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Author Overlay */}
        <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans drop-shadow-lg">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/u/${story.author.username}`}
              className="flex items-center gap-2.5 group"
            >
              <img
                src={story.author.avatar_url}
                alt={story.author.display_name}
                className="w-8 h-8 rounded-full object-cover border-2 border-red-500"
              />
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  {story.author.display_name}
                </p>
                <p className="text-[10px] text-zinc-400">@{story.author.username}</p>
              </div>
            </Link>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-800/40">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{watchPercent}% Would Watch</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{story.average_rating}</span>
              </div>

              <div className="flex items-center gap-1 text-zinc-300 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-700/60">
                <Eye className="w-3.5 h-3.5" />
                <span>{story.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ONE-LINE PITCH HIGHLIGHT BOX */}
      <div className="p-6 bg-gradient-to-r from-red-950/40 via-zinc-900 to-amber-950/40 border-l-4 border-red-600 rounded-2xl shadow-xl space-y-1">
        <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ONE-LINE MOVIE PITCH</span>
        </span>
        <p className="text-base sm:text-lg text-white font-semibold italic leading-relaxed">
          "{story.pitch}"
        </p>
      </div>

      {/* FULL USER-WRITTEN STORY BODY */}
      <article className="p-6 sm:p-10 bg-[#121217] border border-zinc-800/80 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Original Story Script Idea
          </span>
          
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isLiked
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-red-500'}`} />
            <span>{likesCount} Likes</span>
          </button>
        </div>

        {/* Story Text Render */}
        <div className="prose prose-invert max-w-none text-zinc-200 text-base sm:text-lg leading-relaxed font-sans space-y-4 whitespace-pre-line">
          {story.content}
        </div>

        {story.casting_note && (
          <div className="mt-8 pt-6 border-t border-zinc-800/80 bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-1">
              ✍️ Writer's Casting Vision Note:
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 italic">
              "{story.casting_note}"
            </p>
          </div>
        )}
      </article>

      {/* MODULE 1: WOULD YOU WATCH THIS AS A MOVIE? */}
      <WouldWatchModule story={story} />

      {/* MODULE 2: STORY RATING */}
      <StoryRatingModule story={story} onRatingSubmitted={(updated) => setStory(updated)} />

      {/* MODULE 3: CAST YOUR VERSION */}
      <FanCastingModule story={story} />

      {/* MODULE 4: COMMENTS */}
      <CommentsSection storyId={story.id} />

      {/* Modals */}
      {showShareModal && (
        <ShareVerdictModal
          story={story}
          yesPercent={watchPercent}
          rating={story.average_rating}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          storyId={story.id}
          storyTitle={story.title}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showCallModal && (
        <CallModal
          storyId={story.id}
          creatorId={story.author_id}
          onClose={() => setShowCallModal(false)}
        />
      )}

    </div>
  );
}
