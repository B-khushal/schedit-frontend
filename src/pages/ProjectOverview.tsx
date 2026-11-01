import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { apiRequest } from '../lib/api';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { PlatformIcon, KPICard } from '../components/ui';
import {
  ArrowLeft, Plug, BarChart3, Settings, Play, CheckCircle2, AlertCircle,
  ArrowRight, Calendar, Users, TrendingUp, FileText, Image as ImageIcon,
  Clock, ExternalLink, Zap, Activity, Globe, Eye, Layers, RefreshCw,
  ChevronRight, Inbox, PenSquare
} from 'lucide-react';

export function ProjectOverview() {
  const { id } = useParams();
  const { currentProject, setCurrentProject, organizations, currentOrg } = useWorkspace();

  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && (!currentProject || currentProject.id !== id)) {
      let foundProj: any = null;
      for (const org of organizations) {
        const p = org.projects?.find(proj => proj.id === id);
        if (p) {
          foundProj = p;
          break;
        }
      }
      if (foundProj) {
        setCurrentProject(foundProj);
      }
    }
  }, [id, currentProject, organizations, setCurrentProject]);

  useEffect(() => {
    if (!currentProject) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, analyticsRes, assetsRes] = await Promise.allSettled([
          apiRequest(`/api/v1/projects/${currentProject.id}/posts`),
          apiRequest(`/api/v1/projects/${currentProject.id}/analytics/accounts`),
          apiRequest(`/api/v1/projects/${currentProject.id}/assets?limit=6`),
        ]);
        setPosts(postsRes.status === 'fulfilled' ? (postsRes.value || []) : []);
        setAnalytics(analyticsRes.status === 'fulfilled' ? (analyticsRes.value || []) : []);
        const assetData = assetsRes.status === 'fulfilled' ? assetsRes.value : { assets: [] };
        setAssets(assetData?.assets || []);
      } catch (err) {
        console.error('Failed to load project overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentProject]);

  // Derived real metrics
  const socialAccounts = currentProject?.socialAccounts || [];
  const activeAccounts = socialAccounts.filter((a: any) => a.status === 'ACTIVE');
  const totalFollowers = socialAccounts.reduce((sum: number, a: any) => sum + (a.followerCount || 0), 0);
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED' || p.status === 'PENDING_REVIEW' || p.status === 'AWAITING_CLIENT');
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  const draftPosts = posts.filter(p => p.status === 'DRAFT');
  const failedPosts = posts.filter(p => p.status === 'FAILED');

  const latestAnalytics = useMemo(() => {
    if (!analytics.length) return { impressions: 0, reach: 0, engagement: 0 };
    const sorted = [...analytics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted.slice(0, 7);
    return {
      impressions: latest.reduce((s, a) => s + (a.impressions || 0), 0),
      reach: latest.reduce((s, a) => s + (a.reach || 0), 0),
      engagement: latest.reduce((s, a) => s + (a.engagement || 0), 0),
    };
  }, [analytics]);

  const projectAge = currentProject?.createdAt
    ? formatDistanceToNow(new Date(currentProject.createdAt), { addSuffix: true })
    : 'recently';

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 w-full animate-fade-in text-left">

      {/* ── PREMIUM HEADER ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl border border-gray-700/50">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-4">
              <Link to="/app/projects" className="p-2.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all mt-0.5 shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
                    {currentProject.name}
                  </h1>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    currentProject.status === 'ACTIVE'
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  )}>
                    {currentProject.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {currentOrg?.name || 'Organization'}
                  </p>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Created {projectAge}
                  </p>
                  {currentProject.description && (
                    <>
                      <span className="text-gray-600">•</span>
                      <p className="text-sm text-gray-500 italic max-w-sm truncate">{currentProject.description}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 w-full lg:w-auto">
              <Link
                to={`/app/projects/${id}/apps`}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Plug className="w-3.5 h-3.5" />
                Manage Apps
              </Link>
              <Link
                to="/app/studio"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
              >
                <PenSquare className="w-3.5 h-3.5" />
                Create Post
              </Link>
            </div>
          </div>

          {/* Connected Accounts Avatars */}
          {activeAccounts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Connected Channels</p>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                {activeAccounts.map((acc: any) => (
                  <div key={acc.id} className="min-w-[180px] flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-700 border border-gray-600 shrink-0 relative">
                      <img
                        src={acc.profileImage || acc.avatar || `https://i.pravatar.cc/80?u=${acc.id}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <PlatformIcon platform={acc.platform} size="xs" />
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-tight">{acc.displayName || acc.username}</p>
                      <p className="text-[10px] text-gray-500">
                        {acc.followerCount?.toLocaleString() || 0} followers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI METRICS BENTO GRID ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="Connected Channels"
          value={activeAccounts.length}
          icon={<Plug className="w-5 h-5" />}
          trend={`${socialAccounts.length} total accounts`}
          trendUp={activeAccounts.length > 0}
        />
        <KPICard
          label="Total Audience"
          value={totalFollowers >= 1000000 ? `${(totalFollowers / 1000000).toFixed(1)}M` : totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers.toString()}
          icon={<Users className="w-5 h-5" />}
          trend="Real-time Audited"
          trendUp={true}
        />
        <KPICard
          label="Scheduled Queue"
          value={scheduledPosts.length}
          icon={<Calendar className="w-5 h-5" />}
          trend={`${draftPosts.length} drafts pending`}
          trendUp={true}
        />
        <KPICard
          label="Published Posts"
          value={publishedPosts.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={failedPosts.length > 0 ? `${failedPosts.length} failed` : 'All healthy'}
          trendUp={failedPosts.length === 0}
        />
        <KPICard
          label="7-Day Impressions"
          value={latestAnalytics.impressions >= 1000 ? `${(latestAnalytics.impressions / 1000).toFixed(1)}K` : latestAnalytics.impressions.toString()}
          icon={<Eye className="w-5 h-5" />}
          trend="Last 7 days"
          trendUp={latestAnalytics.impressions > 0}
        />
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Posts Activity */}
        <div className="lg:col-span-2 neu-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display">Recent Content Activity</h2>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">{posts.length} total posts in this workspace</p>
            </div>
            <Link to="/app/workflow" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Loading posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No posts yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Create your first post in Content Studio.</p>
              </div>
            ) : (
              posts.slice(0, 5).map((post, i) => {
                const statusColors: Record<string, string> = {
                  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
                  DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
                  FAILED: 'bg-red-50 text-red-700 border-red-200',
                  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
                  AWAITING_CLIENT: 'bg-purple-50 text-purple-700 border-purple-200',
                  APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
                };
                const statusColor = statusColors[post.status] || 'bg-gray-50 text-gray-600 border-gray-200';

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                        {post.media?.length > 0 ? (
                          <ImageIcon className="w-4.5 h-4.5" />
                        ) : (
                          <FileText className="w-4.5 h-4.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/app/workflow/post/${post.id}`} className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1">
                          {post.content?.substring(0, 80) || '(Untitled Post)'}
                          {post.content?.length > 80 && '...'}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border", statusColor)}>
                            {post.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(post.scheduledTime), 'MMM dd, yyyy · h:mm a')}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">
                            {post.priority}
                          </span>
                        </div>
                      </div>
                      <Link to={`/app/workflow/post/${post.id}`} className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-brand-600 shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Navigation & Media Preview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="neu-card rounded-2xl p-6">
            <h2 className="text-sm font-bold text-[var(--neu-text-primary)] font-display mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: PenSquare, label: 'Create New Post', to: '/app/studio', color: 'text-blue-500 bg-blue-50/10' },
                { icon: Plug, label: 'Manage Connected Apps', to: `/app/projects/${id}/apps`, color: 'text-indigo-500 bg-indigo-50/10' },
                { icon: Inbox, label: 'Workflow Queue', to: '/app/workflow', color: 'text-purple-500 bg-purple-50/10' },
                { icon: BarChart3, label: 'Analytics Dashboard', to: '/app/analytics', color: 'text-emerald-500 bg-emerald-50/10' },
                { icon: ImageIcon, label: 'Media Assets Library', to: '/app/assets', color: 'text-amber-500 bg-amber-50/10' },
                { icon: Settings, label: 'API Connections', to: `/app/projects/${id}/api`, color: 'text-gray-500 bg-gray-50/10' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 neu-raised", action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--neu-text-secondary)] group-hover:text-[var(--neu-text-primary)] transition-colors">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Assets Preview */}
          <div className="neu-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--neu-text-primary)] font-display">Recent Assets</h2>
              <Link to="/app/assets" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View All
              </Link>
            </div>
            {assets.length === 0 ? (
              <div className="text-center py-6">
                <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                <p className="text-[11px] text-[var(--neu-text-secondary)]">No assets uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {assets.slice(0, 6).map((asset: any) => (
                  <div
                    key={asset.id}
                    className="aspect-square rounded-xl overflow-hidden neu-inset hover:opacity-90 transition-all cursor-pointer group p-1"
                  >
                    <img
                      src={asset.secureUrl?.replace('/upload/', '/upload/w_150,h_150,c_fill/') || ''}
                      alt=""
                      className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── WORKSPACE ARCHITECTURE FLOW ──────────────────────────────── */}
      <div className="neu-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Workspace Architecture</h2>
            <p className="text-xs text-gray-500 mt-0.5">System health & pipeline status overview</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
          <FlowStep
            icon={Layers}
            title="Project Base"
            desc={`${currentProject.name}`}
            status="healthy"
            metric={`${(currentProject.members?.length || 1)} members`}
          />
          <FlowArrow />
          <FlowStep
            icon={Plug}
            title="Connected Apps"
            desc={`${activeAccounts.length} Active`}
            status={activeAccounts.length > 0 ? 'healthy' : 'warning'}
            link={`/app/projects/${id}/apps`}
            metric={`${socialAccounts.length} total`}
          />
          <FlowArrow />
          <FlowStep
            icon={Settings}
            title="API Connections"
            desc="OAuth & Webhooks"
            status={activeAccounts.length > 0 ? 'healthy' : 'warning'}
            link={`/app/projects/${id}/api`}
            metric="Graph API v18.0"
          />
          <FlowArrow />
          <FlowStep
            icon={BarChart3}
            title="Analytics Engine"
            desc={analytics.length > 0 ? 'Data Synced' : 'Awaiting Data'}
            status={analytics.length > 0 ? 'healthy' : 'warning'}
            link="/app/analytics"
            metric={`${analytics.length} records`}
          />
          <FlowArrow />
          <FlowStep
            icon={Play}
            title="Publishing"
            desc={publishedPosts.length > 0 ? 'Queue Active' : 'Idle'}
            status={failedPosts.length > 0 ? 'warning' : 'healthy'}
            link="/app/workflow"
            metric={`${publishedPosts.length} published`}
          />
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon: Icon, title, desc, status, link, metric }: {
  icon: any;
  title: string;
  desc: string;
  status: 'healthy' | 'warning';
  link?: string;
  metric?: string;
}) {
  const content = (
    <div className={cn("flex flex-col items-center text-center group", link && "cursor-pointer")}>
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative transition-all border-2",
        link && "group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-brand-500/10",
        status === 'healthy'
          ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200/60"
          : "bg-gradient-to-br from-amber-50 to-white border-amber-200/60"
      )}>
        <Icon className={cn("w-6 h-6", link ? "text-brand-500 group-hover:text-brand-400" : "text-gray-500")} />
        <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
          {status === 'healthy' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-800 mb-0.5">{title}</h3>
      <p className="text-[10px] text-gray-500 max-w-[120px]">{desc}</p>
      {metric && (
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">{metric}</p>
      )}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function FlowArrow() {
  return (
    <div className="rotate-90 md:rotate-0 my-2 md:my-0 text-gray-300">
      <ArrowRight className="w-5 h-5" />
    </div>
  );
}

export default ProjectOverview;
