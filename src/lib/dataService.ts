import {
  Story,
  Profile,
  Comment,
  Genre,
  NotificationItem,
  Report,
} from '@/types';

// Utility for fetching wrapper
async function fetchApi(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API Error');
  }
  return res.json();
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sid = localStorage.getItem('katha_sid');
  if (!sid) {
    sid = 'sid_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('katha_sid', sid);
  }
  return sid;
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const shortHash = Math.random().toString(36).substring(2, 6);
  return `${base || 'katha'}-${shortHash}`;
}

export function initDataService() {
  // No longer needed, everything is server-side
}

// ----------------------------------------------------------------------
// AUTHENTICATION & USER PROFILE
// ----------------------------------------------------------------------

export function getCurrentProfile(): Profile | null {
  // This should really be managed by AuthContext, this is a fallback for legacy code
  if (typeof window === 'undefined') return null;
  const str = localStorage.getItem('katha_real_auth_user_v3');
  return str ? JSON.parse(str) : null;
}

export function setCurrentProfile(profile: Profile | null) {
  if (typeof window === 'undefined') return;
  if (profile) {
    localStorage.setItem('katha_real_auth_user_v3', JSON.stringify(profile));
  } else {
    localStorage.removeItem('katha_real_auth_user_v3');
  }
}

export function getProfileByUsername(username: string): Profile | null {
  return null; // Should fetch from backend in a real app, mock removed
}

export function updateProfile(userId: string, updates: Partial<Profile>): Profile | null {
  return null; // Moved to backend
}

// ----------------------------------------------------------------------
// STORIES
// ----------------------------------------------------------------------

export interface QueryOptions {
  genre?: string;
  sortBy?: 'Trending' | 'Newest' | 'Most Read' | 'Highest Rated' | 'Most Discussed' | string;
  search?: string;
  authorId?: string;
  publishedOnly?: boolean;
  visibility?: 'private' | 'public';
}

export async function syncStoriesFromSupabase(): Promise<Story[]> {
  // Legacy function signature maintained for UI compatibility, but Supabase is removed.
  // We just fetch from our new API.
  try {
    const data = await fetchApi('/api/stories');
    return data.stories || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getStories(options: QueryOptions = {}): Story[] {
  // Sync wrapper for legacy UI, but it won't work well synchronously without a cache.
  // The UI should really await this, but we'll return empty if called synchronously and let useEffects handle async.
  console.warn('getStories called synchronously, returning empty array. Use fetchStoriesAsync instead.');
  return [];
}

export async function fetchStoriesAsync(options: QueryOptions = {}): Promise<Story[]> {
  try {
    const params = new URLSearchParams();
    if (options.genre) params.append('genre', options.genre);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.search) params.append('search', options.search);
    if (options.authorId) params.append('authorId', options.authorId);
    if (options.visibility) params.append('visibility', options.visibility);

    const data = await fetchApi(`/api/stories?${params.toString()}`);
    return data.stories || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getStoryBySlugOrId(identifier: string, requestingUserId?: string): Story | null {
  return null; // Legacy sync method
}

export async function fetchStoryBySlugOrId(identifier: string): Promise<Story | null> {
  try {
    const data = await fetchApi(`/api/stories/${identifier}`);
    return data.story || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function recordStoryView(storyId: string) {
  try {
    const viewedStr = sessionStorage.getItem('katha_views_tracker') || '[]';
    const viewedList: string[] = JSON.parse(viewedStr);
    
    if (viewedList.includes(storyId)) return; // Prevent duplicate views in same session
    
    viewedList.push(storyId);
    sessionStorage.setItem('katha_views_tracker', JSON.stringify(viewedList));

    await fetchApi(`/api/stories/${storyId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' })
    });
  } catch (err) {
    console.error(err);
  }
}

export function toggleStoryLike(storyId: string): { isLiked: boolean; newCount: number } {
  // Legacy sync function. Replaced by async toggleStoryLikeAsync
  return { isLiked: false, newCount: 0 };
}

export async function toggleStoryLikeAsync(storyId: string): Promise<{ isLiked: boolean; newCount: number }> {
  const data = await fetchApi(`/api/stories/${storyId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'like' })
  });
  return { isLiked: data.isLiked, newCount: data.newCount };
}

export function getStoryLikeState(storyId: string): boolean {
  return false;
}

export async function checkStoryLikeStateAsync(storyId: string): Promise<boolean> {
  // To implement properly, the GET /api/stories/:id should return user_has_liked
  return false; 
}

export function submitStoryRating(storyId: string, ratingValue: number): Story | null {
  return null;
}

export async function submitStoryRatingAsync(storyId: string, rating: number): Promise<{ averageRating: number; ratingCount: number }> {
  const data = await fetchApi(`/api/stories/${storyId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rate', rating })
  });
  return { averageRating: data.averageRating, ratingCount: data.ratingCount };
}

export function submitWouldWatchVote(storyId: string, vote: 'yes' | 'no'): { yesPercent: number; noPercent: number; totalVotes: number; userVote: 'yes' | 'no' | null } {
  return { yesPercent: 0, noPercent: 0, totalVotes: 0, userVote: null };
}

export async function submitWouldWatchVoteAsync(storyId: string, vote: 'yes' | 'no') {
  const data = await fetchApi(`/api/stories/${storyId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vote', vote })
  });
  
  const total = data.yesCount + data.noCount;
  const yesPercent = total > 0 ? Math.round((data.yesCount / total) * 100) : 0;
  const noPercent = total > 0 ? 100 - yesPercent : 0;

  return { yesPercent, noPercent, totalVotes: total, userVote: vote };
}

export function getWouldWatchStats(storyId: string) {
  return { yesPercent: 0, noPercent: 0, totalVotes: 0, userVote: null };
}

export function submitCastingVote(storyId: string, category: 'hero' | 'director', choice: string) {
  fetchApi(`/api/stories/${storyId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cast', category, choice })
  }).catch(console.error);
}

// ----------------------------------------------------------------------
// COMMENTS & DISCUSSION
// ----------------------------------------------------------------------

export function getComments(storyId: string): Comment[] {
  return [];
}

export async function fetchCommentsAsync(storyId: string): Promise<Comment[]> {
  try {
    const data = await fetchApi(`/api/stories/${storyId}/comments`);
    return data.comments || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function createComment(storyId: string, content: string, parentId?: string | null): Comment {
  return {} as Comment;
}

export async function createCommentAsync(storyId: string, content: string, parentId?: string | null): Promise<Comment> {
  const data = await fetchApi(`/api/stories/${storyId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parent_id: parentId })
  });
  return data.comment;
}

// ----------------------------------------------------------------------
// STORY CREATION & VISIBILITY DEFAULTS
// ----------------------------------------------------------------------

export function createStory(data: any): Story {
  return {} as Story;
}

export async function createStoryAsync(data: {
  title: string;
  genre: Genre;
  pitch: string;
  content: string;
  cover_image_url?: string;
  casting_note?: string;
  published?: boolean;
  visibility?: 'private' | 'public';
}): Promise<Story> {
  const resData = await fetchApi('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return resData.story;
}

export function updateStoryStatus(storyId: string, published: boolean, visibility?: 'private' | 'public'): Story | null {
  return null;
}
