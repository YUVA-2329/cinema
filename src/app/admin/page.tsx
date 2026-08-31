'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStories } from '@/lib/dataService';
import { Report, Story } from '@/types';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Sparkles, BookOpen } from 'lucide-react';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'stories'>('reports');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStories(getStories({ publishedOnly: false }));
  };

  const handleResolve = (id: string, status: 'resolved' | 'dismissed') => {
    const list = [...reports];
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      setReports(list);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              KATHA MODERATOR DASHBOARD
            </h1>
            <p className="text-xs text-zinc-400">
              Community protection, copyright report review & content curation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-full border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reports ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'stories' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Stories ({stories.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <div className="text-2xl font-black text-white">{reports.length}</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase">Total Reports</div>
          </div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <div className="text-2xl font-black text-white">{stories.length}</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase">Published Stories</div>
          </div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <Sparkles className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="text-2xl font-black text-white">{stories.filter((s) => s.is_featured).length}</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase">Featured Stories</div>
          </div>
        </div>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase">Submitted Content Reports</h2>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-500 text-sm">
              No reports submitted yet. Community is clean!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 px-2.5 py-0.5 rounded border border-red-800">
                        Reason: {report.reason}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        Story ID: {report.story_id}
                      </h3>
                    </div>

                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      report.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-xl">
                    "{report.description}"
                  </p>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleResolve(report.id, 'resolved')}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve / Action Taken</span>
                      </button>

                      <button
                        onClick={() => handleResolve(report.id, 'dismissed')}
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Dismiss Report</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase">All Published Katha Stories</h2>

          <div className="space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={story.cover_image_url} alt={story.title} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <Link href={`/story/${story.slug}`} className="text-sm font-bold text-white hover:text-red-400 truncate block">
                      {story.title}
                    </Link>
                    <p className="text-[11px] text-zinc-400">@{story.author.username} • {story.genre}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/story/${story.slug}`}
                    className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
