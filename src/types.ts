export type Platform = 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE';

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor: string;
  authorId: string;
  mediaUrls?: string[];
  metrics?: {
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}
