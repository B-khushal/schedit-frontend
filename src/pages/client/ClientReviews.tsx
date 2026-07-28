import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, Briefcase, CalendarClock, ChevronRight, Loader2, Clock } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { PageHeader, Card, Tabs, StatusPill } from '../../components/ui';
import { format } from 'date-fns';

interface ReviewPost {
  id: string;
  content: string;
  status: string;
  scheduledTime: string;
  project: { id: string; name: string };
  media: any[];
  platforms: any[];
}

export function ClientReviews() {
  const location = useLocation();
  const [posts, setPosts] = useState<ReviewPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine active category from path:
  // /client/reviews -> PENDING / CLIENT_REVIEW
  // /client/approved -> APPROVED
  // /client/rejected -> CLIENT_CHANGES_REQUESTED or REJECTED
  const isApprovedPage = location.pathname.includes('/approved');
  const isRejectedPage = location.pathname.includes('/rejected');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let statusQuery = '';
        if (isApprovedPage) {
          statusQuery = '?status=APPROVED';
        } else if (isRejectedPage) {
          statusQuery = '?status=CLIENT_CHANGES_REQUESTED';
        } else {
          statusQuery = '?status=CLIENT_REVIEW';
        }

        const result = await clientApiRequest<ReviewPost[]>(`/api/v1/clients/me/reviews${statusQuery}`);
        setPosts(result);
      } catch (err) {
        console.error('Failed to load review queue:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.pathname, isApprovedPage, isRejectedPage]);

  let title = 'Review Queue';
  let description = 'Content awaiting your review and approval.';
  if (isApprovedPage) {
    title = 'Approved Content';
    description = 'History of content you have approved.';
  } else if (isRejectedPage) {
    title = 'Changes Requested';
    description = 'Content sent back to editor for revisions.';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading review list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <PageHeader title={title} description={description} />

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Link key={post.id} to={`/client/reviews/${post.id}`}>
            <Card className="p-4 sm:p-5 hover:shadow-elevated hover:border-brand-200 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-200/80">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {post.media && post.media[0] ? (
                    post.media[0].mediaType === 'VIDEO' || post.media[0].mediaType === 'REEL' || post.media[0].mediaType === 'SHORT' ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold">
                        Video
                      </div>
                    ) : (
                      <img src={post.media[0].secureUrl} alt="Media" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <span className="inline-flex text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-100">
                    {post.project.name}
                  </span>
                  <p className="font-bold text-gray-900 text-sm md:text-base md:truncate leading-tight mt-1">
                    {post.content || 'Untitled Content'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                      {format(new Date(post.scheduledTime), 'MMM d, yyyy · h:mm a')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {post.platforms.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold font-mono text-gray-600 uppercase">
                          {p.socialAccount.platform.toLowerCase()}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <StatusPill status={post.status} />
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">Queue is Empty</h3>
            <p className="text-gray-500 text-sm font-medium">No posts found in this queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ClientReviews;
