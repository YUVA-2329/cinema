export type Genre =
  | 'Action'
  | 'Thriller'
  | 'Romance'
  | 'Drama'
  | 'Comedy'
  | 'Horror'
  | 'Sci-Fi'
  | 'Crime'
  | 'Fantasy';

export interface Profile {
  id: string;
  user_id?: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  katha_score: number;
  created_at: string;
  updated_at?: string;
  stories_count?: number;
  total_reads?: number;
  total_likes?: number;
  avg_rating?: number;
}

export interface Story {
  id: string;
  author_id: string;
  author: Profile;
  title: string;
  slug: string;
  genre: Genre;
  pitch: string;
  content: string;
  cover_image_url: string;
  views: number;
  likes_count: number;
  would_watch_yes: number;
  would_watch_no: number;
  average_rating: number;
  rating_count?: number;
  published: boolean;
  visibility?: 'private' | 'public';
  casting_note?: string;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  hero_casting?: Record<string, number>;
  director_casting?: Record<string, number>;
}

export interface StoryLike {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
}

export interface StoryView {
  id: string;
  story_id: string;
  user_id?: string | null;
  session_id?: string | null;
  created_at: string;
}

export interface StoryRating {
  id: string;
  story_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at?: string;
}

export interface WouldWatchVote {
  id: string;
  story_id: string;
  user_id: string;
  vote: 'yes' | 'no';
  created_at?: string;
}

export interface CastingVote {
  id: string;
  story_id: string;
  user_id: string;
  category: 'hero' | 'director';
  choice: string;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  parent_id?: string | null;
  content: string;
  likes_count: number;
  replies?: Comment[];
  created_at: string;
  updated_at?: string;
  user_has_liked?: boolean;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Report {
  id: string;
  reporter_id?: string;
  story_id?: string | null;
  story_title?: string;
  comment_id?: string | null;
  reason: 'copyright' | 'plagiarism' | 'offensive' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'comment' | 'reply' | 'like' | 'milestone' | 'leaderboard';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
