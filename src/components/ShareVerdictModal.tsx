'use client';

import React, { useRef, useState } from 'react';
import { Story } from '@/types';
import { X, Copy, Check, Download, Share2, Sparkles, Flame, Star, Eye } from 'lucide-react';
import { toPng } from 'html-to-image';
import KathaLogo from './KathaLogo';

interface ShareVerdictModalProps {
  story: Story;
  yesPercent: number;
  rating: number;
  onClose: () => void;
}

export default function ShareVerdictModal({ story, yesPercent, rating, onClose }: ShareVerdictModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/story/${story.slug || story.id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${story.title} — KATHA Verdict`,
          text: `🔥 ${yesPercent}% of TFI fans said they'd watch "${story.title}" on KATHA! Read the original movie idea now:`,
          url: shareUrl,
        });
      } catch (e) {
        // Share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `katha-verdict-${story.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export story card:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121216] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instagram Story Ready</span>
          </span>
          <h2 className="text-xl font-black text-white uppercase">Share Katha Verdict</h2>
        </div>

        {/* INSTAGRAM STORY CARD PREVIEW CONTAINER */}
        <div
          ref={cardRef}
          className="p-6 bg-gradient-to-b from-[#1C1C24] via-[#121216] to-[#0A0A0C] border-2 border-red-800/60 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-5"
        >
          <div className="flex justify-center">
            <KathaLogo size="sm" showTagline={true} />
          </div>

          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-zinc-700/80 shadow-md">
            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                {story.genre}
              </span>
              <h3 className="text-lg font-black text-white line-clamp-1 mt-1">{story.title}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Verdict</span>
              <span className="text-sm font-extrabold text-orange-400 flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {yesPercent}%
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Rating</span>
              <span className="text-sm font-extrabold text-amber-400 flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Reads</span>
              <span className="text-sm font-extrabold text-zinc-200 flex items-center gap-0.5">
                <Eye className="w-3.5 h-3.5" />
                {story.views}
              </span>
            </div>
          </div>

          <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl">
            <p className="text-xs italic text-zinc-300 font-sans">
              "{story.pitch}"
            </p>
            <p className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">
              “TFI FANS HAVE SPOKEN.”
            </p>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Read full story on KATHA.APP
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadCard}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{downloading ? 'Exporting...' : 'Save Image Card'}</span>
          </button>

          <button
            onClick={handleWebShare}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Story</span>
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs py-2.5 rounded-xl transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
        </button>

      </div>
    </div>
  );
}
