'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile } from '@/types';

interface AuthContextType {
  user: any | null; // Using any for synthetic user compatibility with existing code
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setAuthUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
  setAuthUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
          if (data.user) {
            const loadedProfile: Profile = {
              id: data.user.id,
              user_id: data.user.id,
              username: data.user.username,
              display_name: data.user.displayName,
              avatar_url: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              bio: data.user.bio || '',
              katha_score: data.user.kathaScore,
              created_at: data.user.createdAt,
            };
            setProfileState(loadedProfile);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch auth state', err);
      }
      
      // Fallback profile if API fails (e.g. ngrok intercept or vercel sqlite error)
      const fallbackId = Math.random().toString(36).substring(2, 9);
      setProfileState({
        id: fallbackId,
        user_id: fallbackId,
        username: `anon_${fallbackId}`,
        display_name: `Anonymous Writer`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        bio: 'Just exploring Katha!',
        katha_score: 100,
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const refreshProfile = async () => {
    await fetchSession();
  };

  // Create a synthetic user object to maintain compatibility with existing code
  const user = profile ? {
    id: profile.id,
    email: `${profile.username}@katha.app`,
    user_metadata: {
      display_name: profile.display_name,
      username: profile.username,
      avatar_url: profile.avatar_url,
    },
  } : null;

  return (
    <AuthContext.Provider value={{ user, profile, session: null, loading, refreshProfile, signOut: async () => {}, setAuthUser: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
