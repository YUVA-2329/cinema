import { Story, Profile, Achievement, Comment, NotificationItem } from '@/types';

export const SAMPLE_PROFILES: Profile[] = [];

export const SAMPLE_STORIES: Story[] = [];

export const SAMPLE_COMMENTS: Comment[] = [];

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [];

export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81801',
    name: 'FIRST KATHA',
    description: 'Published your first original story on KATHA.',
    icon: '🏅',
    criteria: 'publish_1_story',
  },
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81802',
    name: 'FIRST 100 READS',
    description: 'Your story reached 100 readers.',
    icon: '👀',
    criteria: 'reach_100_reads',
  },
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81803',
    name: '1K CLUB',
    description: 'Your story reached 1,000 readers.',
    icon: '🔥',
    criteria: 'reach_1000_reads',
  },
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81804',
    name: 'STORYTELLER',
    description: 'Published 5 original stories.',
    icon: '✍️',
    criteria: 'publish_5_stories',
  },
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81805',
    name: 'STORY OF THE WEEK',
    description: 'Ranked #1 on the weekly leaderboard.',
    icon: '🏆',
    criteria: 'win_weekly_rank',
  },
  {
    id: 'b3017a42-70b9-43c7-9755-2d4dfbb81806',
    name: 'CROWD FAVOURITE',
    description: 'Achieved over 85% Would Watch score.',
    icon: '💥',
    criteria: 'high_would_watch_score',
  },
];
