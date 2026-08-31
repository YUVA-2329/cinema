'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Report } from '@/types';

interface ReportModalProps {
  storyId: string;
  storyTitle: string;
  onClose: () => void;
}

export default function ReportModal({ storyId, storyTitle, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<Report['reason']>('copyright');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121216] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-800/60 rounded-xl text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase">Report Story</h2>
            <p className="text-xs text-zinc-400 font-sans truncate max-w-[260px]">{storyTitle}</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Report Submitted</h3>
            <p className="text-xs text-zinc-400">
              Our moderation team will review this story within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Report['reason'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="copyright">Copyright issue / Infringement</option>
                <option value="plagiarism">Plagiarism (Copied script/novel)</option>
                <option value="offensive">Offensive / Inappropriate Content</option>
                <option value="spam">Spam / Low Quality</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Additional Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the issue or provide link to original source if applicable..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all"
            >
              SUBMIT REPORT
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
