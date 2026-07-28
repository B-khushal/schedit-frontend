import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderOpen, ArrowLeft, ClipboardCheck, CalendarDays, Briefcase, CalendarClock, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { PageHeader, Card, Tabs, Badge, Button, StatusPill } from '../../components/ui';
import { format } from 'date-fns';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledTime: string;
  media: any[];
  platforms: any[];
}

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  scheduledPosts: Post[];
}

export function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const result = await clientApiRequest<ProjectDetail>(`/api/v1/clients/me/projects/${id}`);
        setProject(result);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Project not found or access denied.</p>
        <Link to="/client/projects" className="mt-4 inline-block text-brand-600 font-semibold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const posts = project.scheduledPosts || [];

  const pending = posts.filter((p) => p.status === 'CLIENT_REVIEW');
  const approved = posts.filter((p) => p.status === 'APPROVED' || p.status === 'SCHEDULED' || p.status === 'PUBLISHED');
  const changes = posts.filter((p) => p.status === 'CLIENT_CHANGES_REQUESTED' || p.status === 'REJECTED');

  const filteredPosts =
    activeTab === 'pending' ? pending :
    activeTab === 'approved' ? approved :
    activeTab === 'changes' ? changes : posts;

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <div className="flex items-center gap-3">
        <Link to="/client/projects" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title={project.name}
          description={project.description || 'Workspace Project Management.'}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: `All Posts (${posts.length})` },
          { id: 'pending', label: `Pending Review (${pending.length})` },
          { id: 'approved', label: `Approved/Scheduled (${approved.length})` },
          { id: 'changes', label: `Changes Requested (${changes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        {filteredPosts.map((post) => (
          <Link key={post.id} to={`/client/reviews/${post.id}`}>
            <Card className="p-4 sm:p-5 hover:shadow-elevated hover:border-brand-200 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-200/80">
              <div className="flex items-start gap-4 min-w-0">
                {/* Media thumbnail if exists */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {post.media && post.media[0] ? (
                    post.media[0].mediaType === 'VIDEO' || post.media[0].mediaType === 'REEL' || post.media[0].mediaType === 'SHORT' ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold">
                        Video
                      </div>
                    ) : (
                      <img
                        src={post.media[0].secureUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-gray-900 text-sm md:text-base md:truncate leading-tight">
                    {post.content || 'Untitled Content'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                      {format(new Date(post.scheduledTime), 'MMM d, yyyy · h:mm a')}
                    </span>
                    <span className="flex items-center gap-1.5 mt-0.5">
                      {post.platforms.map((p, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold font-mono text-gray-600 uppercase"
                        >
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">No Posts Awaiting Review</h3>
            <p className="text-gray-500 text-sm font-medium">No posts matches the selected filter status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ClientProjectDetail;
