import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getInitials(name: string): string {
  if (!name) return 'SP';
  const clean = name.replace(/^@/, '').trim();
  if (!clean) return 'SP';
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (clean.toLowerCase().includes('spring') || clean.toLowerCase().includes('sbf') || clean.toLowerCase().includes('florist')) {
    return 'SP';
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getAccountAvatar(acc: any): string {
  if (!acc) return '';
  const url = acc.profileImage || acc.avatar || acc.avatarUrl;
  if (url && typeof url === 'string' && url.length > 5 && !url.includes('pravatar.cc') && !url.includes('unsplash.com')) {
    return url;
  }
  const id = acc.pageId || acc.platformAccountId || acc.id;
  if (id && !id.startsWith('mock-')) {
    return `https://graph.facebook.com/v18.0/${id}/picture?type=large`;
  }
  return '';
}

export function getPlatformColor(platform: string): string {
  switch (platform?.toUpperCase()) {
    case 'LINKEDIN': return '#0A66C2';
    case 'INSTAGRAM': return '#E4405F';
    case 'FACEBOOK': return '#1877F2';
    case 'YOUTUBE': return '#FF0000';
    default: return '#6B7280';
  }
}

export function getPlatformLabel(platform: string): string {
  switch (platform?.toUpperCase()) {
    case 'LINKEDIN': return 'in';
    case 'INSTAGRAM': return 'ig';
    case 'FACEBOOK': return 'f';
    case 'YOUTUBE': return 'yt';
    default: return platform?.[0]?.toUpperCase() || '?';
  }
}

export function getPlatformGradient(platform: string): string {
  switch (platform?.toUpperCase()) {
    case 'LINKEDIN': return 'bg-[#0A66C2] text-white';
    case 'INSTAGRAM': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white';
    case 'FACEBOOK': return 'bg-[#1877F2] text-white';
    case 'YOUTUBE': return 'bg-[#FF0000] text-white';
    default: return 'bg-gray-600 text-white';
  }
}

export function statusColor(status: string): { bg: string; text: string; dot: string; border: string } {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PUBLISHED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' };
    case 'PUBLISHING':
      return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' };
    case 'SCHEDULED':
    case 'APPROVED':
      return { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' };
    case 'UNDER_REVIEW':
    case 'REVIEW':
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' };
    case 'CLIENT_REVIEW':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' };
    case 'CHANGES_REQUESTED':
      return { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' };
    case 'CLIENT_CHANGES_REQUESTED':
      return { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' };
    case 'FAILED':
    case 'ERROR':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' };
    case 'DRAFT':
      return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };
    case 'IN_PROGRESS':
      return { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };
  }
}

export function statusLabel(status: string): string {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PUBLISHED': return 'Published';
    case 'PUBLISHING': return 'Publishing';
    case 'SCHEDULED': return 'Scheduled';
    case 'APPROVED': return 'Approved';
    case 'UNDER_REVIEW':
    case 'REVIEW': return 'In Review';
    case 'CLIENT_REVIEW': return 'Client Review';
    case 'CHANGES_REQUESTED': return 'Changes Requested';
    case 'CLIENT_CHANGES_REQUESTED': return 'Client Changes';
    case 'FAILED':
    case 'ERROR': return 'Failed';
    case 'DRAFT': return 'Draft';
    case 'IN_PROGRESS': return 'In Progress';
    case 'READY_FOR_REVIEW': return 'Ready for Review';
    case 'CANCELLED': return 'Cancelled';
    case 'ARCHIVED': return 'Archived';
    default: return status || 'Unknown';
  }
}
