'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProfileByUsername, getStories, getCurrentProfile, updateProfile } from '@/lib/dataService';
import { Profile, Story } from '@/types';
import StoryCard from '@/components/StoryCard';
import AchievementBadge from '@/components/AchievementBadge';
import { SAMPLE_ACHIEVEMENTS } from '@/lib/sampleData';
import { Sparkles, Calendar, BookOpen, Eye, Heart, Star, Award, PenSquare, Edit3, X, Check } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    if (!username) return;
    const p = getProfileByUsername(username);
    if (p) {
      setProfile(p);
      const current = getCurrentProfile();
      if (current && current.username.toLowerCase() === p.username.toLowerCase()) {
        setIsOwnProfile(true);
      }
      const all = getStories({ authorId: p.id });
      setUserStories(all);
    }
  }, [username]);

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditName(profile.display_name);
    setEditBio(profile.bio || '');
    setEditAvatar(profile.avatar_url || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updated = updateProfile(profile.id, {
      display_name: editName.trim(),
      bio: editBio.trim(),
      avatar_url: editAvatar.trim() || profile.avatar_url,
    });

    if (updated) setProfile(updated);
    setShowEditModal(false);
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <p className="text-zinc-400 text-sm">The user @{username} does not exist on KATHA.</p>
        <Link href="/" className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-full">
          Return Home
        </Link>
      </div>
    );
  }

  const totalReads = userStories.reduce((sum, s) => sum + s.views, 0);
  const totalLikes = userStories.reduce((sum, s) => sum + s.likes_count, 0);
  const avgRating = userStories.length > 0
    ? Number((userStories.reduce((sum, s) => sum + s.average_rating, 0) / userStories.length).toFixed(1))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#16161D] via-zinc-950 to-black border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-red-600 shadow-xl shrink-0"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.display_name}</h1>
                <p className="text-xs text-zinc-400 font-mono">@{profile.username}</p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-auto">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs px-4 py-1.5 rounded-full shadow-md">
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>SCORE: {profile.katha_score}</span>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={handleOpenEdit}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-full border border-zinc-700 transition-colors"
                    title="Edit profile"
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              {profile.bio || 'TFI Movie Storyteller on KATHA.'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-500 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80 text-center">
          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div className="text-xl font-black text-white flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4 text-red-500" />
              <span>{userStories.length}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Stories</div>
          </div>

          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div className="text-xl font-black text-white flex items-center justify-center gap-1">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{totalReads.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Total Reads</div>
          </div>

          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div className="text-xl font-black text-white flex items-center justify-center gap-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span>{totalLikes.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Likes</div>
          </div>

          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{avgRating}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Avg Rating</div>
          </div>
        </div>

      </div>

      {/* ACHIEVEMENTS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            WRITER ACHIEVEMENTS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SAMPLE_ACHIEVEMENTS.map((ach, idx) => (
            <AchievementBadge key={ach.id} achievement={ach} unlocked={idx < 4} />
          ))}
        </div>
      </div>

      {/* STORIES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-red-500" />
            <span>PUBLISHED KATHALU ({userStories.length})</span>
          </h2>
        </div>

        {userStories.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-500 text-sm">
            No published stories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {userStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121216] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-white uppercase">Edit Profile</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg"
              >
                SAVE CHANGES
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
