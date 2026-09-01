'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createStory } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';
import { Genre } from '@/types';
import { PenSquare, AlertCircle, Sparkles, Image as ImageIcon, FileText, Globe, Loader2 } from 'lucide-react';

const GENRES: Genre[] = [
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

export default function WriteStoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre>('Thriller');
  const [pitch, setPitch] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [castingNote, setCastingNote] = useState('');
  const [confirmedOriginal, setConfirmedOriginal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (!pitch) {
      setErrorMsg("Please enter a One-Line Pitch first before generating!");
      return;
    }
    setIsGeneratingStory(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ pitch, genre })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }
      const data = await res.json();
      setContent(data.story);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI service.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      // no-redirect;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Verifying writer authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isWordCountValid = wordCount >= 300 && wordCount <= 5000;

  const handleCreate = async (isDraft: boolean) => {
    setErrorMsg('');

    if (!user) {
      // no-redirect;
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a story title.');
      return;
    }

    if (!pitch.trim()) {
      setErrorMsg('Please provide a one-line movie pitch.');
      return;
    }

    if (!isDraft) {
      if (wordCount < 300) {
        setErrorMsg(`Your story needs at least 300 words to publish. Current count: ${wordCount} words.`);
        return;
      }

      if (wordCount > 5000) {
        setErrorMsg(`Your story exceeds the 5000 words limit. Current count: ${wordCount} words.`);
        return;
      }

      if (!confirmedOriginal) {
        setErrorMsg('You must confirm that this story is your original work before publishing.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { createStoryAsync } = await import('@/lib/dataService');
      const newStory = await createStoryAsync({
        title,
        genre,
        pitch,
        content,
        cover_image_url: coverImageUrl,
        casting_note: castingNote,
        published: !isDraft,
        visibility: isDraft ? 'private' : 'public',
      });

      if (isDraft) {
        router.push('/dashboard/drafts');
      } else {
        router.push(`/story/${newStory.slug}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save story.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 mb-2">
          <PenSquare className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          ✍️ TELL US YOUR KATHA
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 font-sans">
          “Your movie idea deserves an audience.”
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-xs sm:text-sm text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <div className="p-6 sm:p-8 bg-[#121217] border border-zinc-800 rounded-3xl space-y-6">
        
        {/* Title & Genre */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Story Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Last Station"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* One-Line Pitch */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
            One-Line Pitch <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-zinc-500 mb-2">
            Describe your movie concept in 1 sentence hook.
          </p>
          <input
            type="text"
            required
            placeholder="Your 1-line hook..."
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Story Body & Word Counter */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-4">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Story Body (కథ) <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory || !pitch}
                className="flex items-center gap-1.5 text-[10px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-500 px-3 py-1 rounded-full transition-colors"
              >
                {isGeneratingStory ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Generate from Pitch</span>
              </button>
            </div>
            <span
              className={`text-xs font-mono font-bold ${
                isWordCountValid ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {wordCount} / 5000 words (Min 300)
            </span>
          </div>
          <textarea
            rows={14}
            required
            placeholder="Write your story outline, scene breakdown, characters, and climax here (500–1500 words recommended)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isGeneratingStory}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-none font-sans leading-relaxed disabled:opacity-50"
          />
        </div>

        {/* Cover Image & Casting Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Cover Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Casting Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. What actor do you imagine playing the hero?"
              value={castingNote}
              onChange={(e) => setCastingNote(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Mandatory Copyright Confirmation Checkbox */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmedOriginal}
              onChange={(e) => setConfirmedOriginal(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-600 rounded"
            />
            <span className="text-xs text-zinc-300 font-sans leading-relaxed">
              ☑ By publishing, I confirm that this story is my original work or I have permission to publish it, and it does not infringe on existing copyrights or pirated movie scripts.
            </span>
          </label>
        </div>

        {/* Save Draft & Publish Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleCreate(true)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-sm py-3.5 rounded-2xl transition-all"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>SAVE DRAFT</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-red-950/60 transition-all disabled:opacity-50"
          >
            <Globe className="w-4 h-4" />
            <span>PUBLISH STORY 🔥</span>
          </button>
        </div>

      </div>

    </div>
  );
}
