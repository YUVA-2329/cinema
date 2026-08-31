'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: Profile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { setAuthUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured()) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: displayName, username },
            },
          });
          if (error) throw error;
          if (data.user) {
            const newProfile: Profile = {
              id: data.user.id,
              user_id: data.user.id,
              username: username || email.split('@')[0],
              display_name: displayName || 'Katha Writer',
              avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
              bio: 'TFI Movie Storyteller',
              katha_score: 200,
              created_at: new Date().toISOString(),
            };
            setAuthUser(newProfile);
            onSuccess(newProfile);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            const profile: Profile = {
              id: data.user.id,
              user_id: data.user.id,
              username: email.split('@')[0],
              display_name: data.user.user_metadata?.display_name || email.split('@')[0],
              avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
              bio: 'TFI Movie Fan',
              katha_score: 350,
              created_at: new Date().toISOString(),
            };
            setAuthUser(profile);
            onSuccess(profile);
          }
        }
      } else {
        const mockProfile: Profile = {
          id: 'user_' + Date.now().toString(36),
          user_id: 'user_' + Date.now().toString(36),
          username: username.trim() || email.split('@')[0] || 'tfi_fan',
          display_name: displayName.trim() || email.split('@')[0] || 'TFI Movie Buff',
          avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          bio: 'Writing movie concepts & rating stories on KATHA.',
          katha_score: 500,
          created_at: new Date().toISOString(),
        };
        setAuthUser(mockProfile);
        onSuccess(mockProfile);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
      } else {
        const googleProfile: Profile = {
          id: 'user_google_' + Date.now().toString(36),
          user_id: 'user_google_' + Date.now().toString(36),
          username: 'tfi_star_writer',
          display_name: 'Telugu Cinema Fan',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          bio: 'Logged in via Google. Passionate TFI storyteller.',
          katha_score: 600,
          created_at: new Date().toISOString(),
        };
        setAuthUser(googleProfile);
        onSuccess(googleProfile);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121216] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 mb-3">
            <Sparkles className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            {isSignUp ? 'Join KATHA Community' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1 font-medium">
            {isSignUp ? 'Publish your movie ideas & earn Katha Score' : 'Sign in to rate stories, cast heroes & discuss'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="px-3 text-xs text-zinc-500 uppercase tracking-widest bg-[#121216]">or email</span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Movie Storyteller"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-semibold text-zinc-500">@</span>
                  <input
                    type="text"
                    required
                    placeholder="movie_writer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/50 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account 🔥' : 'Sign In 🎬'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
