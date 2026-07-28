import { Post } from './types';
import { addDays, subDays, formatISO } from 'date-fns';

const now = new Date();

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    content: 'We are thrilled to announce our new funding round! Thanks to all our partners and team members who made this possible. 🚀 #startup #funding',
    platforms: ['LINKEDIN', 'FACEBOOK'],
    status: 'published',
    scheduledFor: formatISO(subDays(now, 2)),
    authorId: 'u1',
    metrics: { likes: 1240, shares: 156, comments: 89, impressions: 45000 },
  },
  {
    id: '2',
    content: '5 ways to optimize your social media workflow for 2024. Thread below 🧵👇',
    platforms: ['LINKEDIN'],
    status: 'scheduled',
    scheduledFor: formatISO(addDays(now, 1)),
    authorId: 'u1',
  },
  {
    id: '3',
    content: 'Behind the scenes at our annual company retreat in Tahoe! 🏔️',
    platforms: ['INSTAGRAM'],
    status: 'draft',
    scheduledFor: formatISO(addDays(now, 5)),
    authorId: 'u2',
    mediaUrls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
  },
  {
    id: '4',
    content: 'New feature alert: AI-powered caption generation is now live! Try it out today.',
    platforms: ['LINKEDIN', 'FACEBOOK', 'YOUTUBE'],
    status: 'failed',
    scheduledFor: formatISO(subDays(now, 1)),
    authorId: 'u1',
  },
];
