'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KathaLogo from '@/components/KathaLogo';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setAuthUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured()) {
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
            avatar_url: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            bio: 'TFI Movie Fan & Storyteller',
            katha_score: 100,
            created_at: new Date().toISOString(),
          };
          setAuthUser(profile);
          router.push('/');
        }
      } else {
        const fallbackProfile: Profile = {
          id: 'user_' + Date.now().toString(36),
          user_id: 'user_' + Date.now().toString(36),
          username: email.split('@')[0] || 'tfi_fan',
          display_name: email.split('@')[0] || 'Telugu Cinema Fan',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          bio: 'TFI Movie Storyteller',
          katha_score: 500,
          created_at: new Date().toISOString(),
        };
        setAuthUser(fallbackProfile);
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
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
          display_name: 'Telugu Cinema Lover',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          bio: 'Logged in via Google. Writing stories on KATHA.',
          katha_score: 600,
          created_at: new Date().toISOString(),
        };
        setAuthUser(googleProfile);
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121216] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <KathaLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Welcome to KATHA
          </h1>
          <p className="text-sm text-zinc-400 font-sans">
            “Your stories deserve an audience.”
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="px-3 text-xs text-zinc-500 uppercase tracking-widest bg-[#121216]">or login with email</span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-zinc-400">Password</label>
              <Link href="/forgot-password" className="text-xs text-amber-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In 🎬'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/80">
          <p className="text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-amber-400 font-bold hover:underline">
              Create KATHA Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
