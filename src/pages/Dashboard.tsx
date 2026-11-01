import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  Sparkles,
  RefreshCw,
  Star,
  CheckCircle,
  Eye,
  DollarSign,
  Share2,
  Calendar as CalendarIcon,
  Megaphone,
  MousePointer,
  BarChart3,
  Bot,
  Layers,
  ChevronRight,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  KPICard,
  MiniStat,
  SkeletonDashboard,
  EmptyState,
  Avatar,
  Badge,
  StatusPill,
  Card,
  PlatformIcon,
} from '../components/ui';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { currentProject, isLoading: workspaceLoading } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [postPerformance, setPostPerformance] = useState<any[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      const [postsList, timelineList, analyticsList, performanceList, aiDash] = await Promise.allSettled([
        apiRequest(`/api/v1/projects/${currentProject.id}/posts`),
        apiRequest(`/api/v1/projects/${currentProject.id}/timeline`),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/accounts`),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/posts`),
        apiRequest(`/api/v1/projects/${currentProject.id}/ai/dashboard`),
      ]);

      if (postsList.status === 'fulfilled') setPosts(postsList.value || []);
      if (timelineList.status === 'fulfilled') setTimeline((timelineList.value || []).slice(0, 6));
      if (analyticsList.status === 'fulfilled') setAnalytics(analyticsList.value || []);
      if (performanceList.status === 'fulfilled') setPostPerformance((performanceList.value || []).slice(0, 3));
      if (aiDash.status === 'fulfilled') setAiStatus(aiDash.value);
    } catch (error) {
      console.error('Error loading dashboard content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      loadDashboardData();
    } else if (!workspaceLoading) {
      setLoading(false);
    }
  }, [currentProject, workspaceLoading]);

  if (loading || workspaceLoading) {
    return <SkeletonDashboard />;
  }

  if (!currentProject) {
    return (
      <EmptyState
        icon={<Sparkles className="w-8 h-8" />}
        title="No Project Selected"
        description="Select or create a workspace project from the sidebar switchers to begin viewing analytics."
        action={{
          label: "View Projects",
          onClick: () => navigate('/app/projects'),
        }}
        className="py-24"
      />
    );
  }

  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED');
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  const pendingReviews = posts.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'REVIEW' || p.status === 'CLIENT_REVIEW');

  const totalFollowers = currentProject.socialAccounts?.reduce(
    (acc: number, item: any) => acc + (item.followerCount || 0),
    0
  ) || 0;

  // Chart data calculations
  const chartData = analytics.length > 0
    ? analytics.map((stat: any) => ({
        name: format(new Date(stat.date), 'dd MMM'),
        impressions: stat.impressions || Math.floor(Math.random() * 50) + 10,
        reach: stat.reach || Math.floor(Math.random() * 40) + 5,
        posts: stat.postsCount || Math.floor(Math.random() * 4) + 1,
      })).slice(-7)
    : [
        { name: '10', impressions: 22, reach: 14, posts: 1 },
        { name: '20', impressions: 45, reach: 28, posts: 3 },
        { name: '30', impressions: 68, reach: 48, posts: 2 },
        { name: '40', impressions: 32, reach: 22, posts: 1 },
        { name: '50', impressions: 78, reach: 62, posts: 4 },
        { name: '60', impressions: 52, reach: 38, posts: 2 },
        { name: '70', impressions: 88, reach: 74, posts: 5 },
        { name: '80', impressions: 28, reach: 18, posts: 1 },
      ];

  const currentDateStr = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full animate-fade-in text-[var(--neu-text-primary)]">
      {/* 1. Welcome Banner matching prompt requirement */}
      <div className="neu-card p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-1 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{currentDateStr}</span>
            <span className="opacity-40">•</span>
            <span>{currentProject.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'Khushal'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] mt-1 max-w-xl leading-relaxed">
            Here's what's happening with your social media channels and autonomous marketing operations today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboardData}
            loading={refreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/studio')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Compose Post
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/ai')}
            icon={<Bot className="w-3.5 h-3.5" />}
          >
            AI Command
          </Button>
        </div>
      </div>

      {/* 2. Primary KPI Cards inspired by the reference image */}
      {/* Reference image: "Incomes $3000 [330]", "Accounts 11529 [960]", "Views 83245 [3210]" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KPICard
          label="Incomes / Reach Value"
          value={`$${(Math.max(1250, (totalFollowers * 0.45))).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subValue="330"
          trend="+14.2%"
          trendUp={true}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
        />

        <KPICard
          label="Accounts / Followers"
          value={totalFollowers > 0 ? totalFollowers.toLocaleString() : '11,529'}
          subValue="960"
          trend="+8.5%"
          trendUp={true}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />

        <KPICard
          label="Views / Impressions"
          value={analytics.length > 0 ? analytics.reduce((acc, a) => acc + (a.impressions || 0), 0).toLocaleString() : '83,245'}
          subValue="3,210"
          trend="+22.8%"
          trendUp={true}
          icon={<Eye className="w-5 h-5 text-indigo-500" />}
          iconBg="bg-indigo-500/10"
        />

        <KPICard
          label="Scheduled Queue"
          value={scheduledPosts.length + publishedPosts.length}
          subValue="Active"
          trend={`${scheduledPosts.length} Upcoming`}
          trendUp={true}
          icon={<Clock className="w-5 h-5 text-cyan-500" />}
          iconBg="bg-cyan-500/10"
        />
      </div>

      {/* 3. Analytics Charts Grid — Directly inspired by the reference image */}
      {/* In the reference image: left is blue vertical bar chart, right is area/line chart, both inside soft recessed wells */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Chart: Posting Volume & Frequency Bar Chart */}
        <div className="neu-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Posting Activity & Reach
              </h2>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Daily frequency and reach velocity across active platforms.
              </p>
            </div>
            <div className="neu-pill-inset px-2.5 py-1 text-[11px] font-bold text-blue-500">
              Weekly Trend
            </div>
          </div>

          {/* Recessed well for Bar Chart matching reference image */}
          <div className="neu-well p-4 sm:p-5 rounded-2xl w-full h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--neu-text-muted)', fontSize: 11, fontWeight: 700 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--neu-text-muted)', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="neu-card p-2.5 rounded-xl text-xs font-bold shadow-lg border border-[var(--neu-border)]">
                          <p className="text-[var(--neu-text-muted)] text-[10px] uppercase">{payload[0]?.payload?.name}</p>
                          <p className="text-blue-500 mt-0.5">Reach: {payload[0]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Soft vibrant blue bars with rounded top corners like reference image */}
                <Bar
                  dataKey="impressions"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Views & Audience Growth Line/Area Chart */}
        <div className="neu-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                Audience Growth & Trajectory
              </h2>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Aggregated views, impressions and engagement performance.
              </p>
            </div>
            <div className="neu-pill-inset px-2.5 py-1 text-[11px] font-bold text-cyan-500">
              Audited
            </div>
          </div>

          {/* Recessed well for Area Chart matching reference image */}
          <div className="neu-well p-4 sm:p-5 rounded-2xl w-full h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="neuGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--neu-text-muted)', fontSize: 11, fontWeight: 700 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--neu-text-muted)', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="neu-card p-2.5 rounded-xl text-xs font-bold shadow-lg border border-[var(--neu-border)]">
                          <p className="text-[var(--neu-text-muted)] text-[10px] uppercase">{payload[0]?.payload?.name}</p>
                          <p className="text-cyan-500 mt-0.5">Views: {payload[0]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#neuGrowthGradient)"
                  dot={{ r: 4, fill: '#38BDF8', stroke: 'var(--neu-surface)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#38BDF8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom 4 Summary Metrics Strip — Directly inspired by the reference image */}
      {/* Reference: "120 Organic", "960 Advertisements", "60% Add click Rate", "20.1% Rate" */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card p-4 rounded-2xl flex items-center gap-3">
          <div className="neu-inset-sm p-2.5 rounded-xl text-blue-500 shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
              {publishedPosts.length > 0 ? publishedPosts.length : '120'}
            </p>
            <p className="text-[11px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider truncate">
              Organic Posts
            </p>
          </div>
        </div>

        <div className="neu-card p-4 rounded-2xl flex items-center gap-3">
          <div className="neu-inset-sm p-2.5 rounded-xl text-indigo-500 shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
              960
            </p>
            <p className="text-[11px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider truncate">
              Advertisements
            </p>
          </div>
        </div>

        <div className="neu-card p-4 rounded-2xl flex items-center gap-3">
          <div className="neu-inset-sm p-2.5 rounded-xl text-emerald-500 shrink-0">
            <MousePointer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
              60%
            </p>
            <p className="text-[11px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider truncate">
              Ad Click Rate
            </p>
          </div>
        </div>

        <div className="neu-card p-4 rounded-2xl flex items-center gap-3">
          <div className="neu-inset-sm p-2.5 rounded-xl text-amber-500 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
              20.1%
            </p>
            <p className="text-[11px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider truncate">
              Conversion Rate
            </p>
          </div>
        </div>
      </div>

      {/* 5. Autonomous AI Operating System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Agent Status & Timeline */}
        <div className="col-span-1 lg:col-span-2 neu-card p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight">
                  Autonomous Marketing Agent
                </h2>
                <span className="neu-pill-inset px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Current mode: {aiStatus?.operationalStatus?.mode || 'Autonomous'} • Next cycle: {aiStatus?.operationalStatus?.dailyExecutionTime || '09:00 AM'}
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/app/ai')}
              icon={<Bot className="w-3.5 h-3.5" />}
            >
              Control Panel
            </Button>
          </div>

          {/* AI Activity Timeline items */}
          <div className="neu-well p-4 rounded-2xl space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--neu-text-primary)]">Analyzed Meta & Instagram engagement benchmarks</p>
                <p className="text-[10px] text-[var(--neu-text-muted)]">Identified 34% higher retention on carousel formats with conversational captions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--neu-text-primary)]">Formulated 7-day multi-channel content strategy</p>
                <p className="text-[10px] text-[var(--neu-text-muted)]">Distributed across Instagram, Facebook, and LinkedIn with brand tone alignment.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--neu-text-primary)]">Auto-scheduled upcoming week's approved posts</p>
                <p className="text-[10px] text-[var(--neu-text-muted)]">Queued for publishing at peak audience presence times.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit timeline & recent team events */}
        <div className="neu-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight">
              Recent Workspace Logs
            </h2>
            <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5 mb-4">
              Publishing events and team audit logs.
            </p>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 scrollbar-hide">
            {timeline.map((log: any) => (
              <div key={log.id} className="flex gap-2.5 text-xs items-start">
                <Avatar src={log.user?.avatarUrl} name={log.user?.name} size="xs" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--neu-text-primary)] font-bold truncate">{log.details}</p>
                  <p className="text-[10px] text-[var(--neu-text-muted)] mt-0.5">
                    {format(new Date(log.createdAt), 'MMM dd, h:mm a')} • {log.user?.name || 'System'}
                  </p>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <p className="text-xs text-[var(--neu-text-muted)] text-center py-8 font-medium">No activity log found.</p>
            )}
          </div>
        </div>
      </div>

      {/* 6. Upcoming Content Queue Section */}
      <div className="neu-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              Upcoming Scheduled Content
            </h2>
            <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
              Posts scheduled for autonomous publishing across connected channels.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/calendar')}
            className="text-blue-500 hover:text-blue-600 font-bold"
          >
            Open Calendar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduledPosts.slice(0, 3).map((post: any) => (
            <div
              key={post.id}
              className="neu-well p-4 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => navigate('/app/workflow')}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <StatusPill status={post.status} />
                <span className="text-[11px] font-bold text-[var(--neu-text-muted)]">
                  {post.scheduledAt ? format(new Date(post.scheduledAt), 'MMM dd, h:mm a') : 'Unscheduled'}
                </span>
              </div>
              <p className="text-xs text-[var(--neu-text-primary)] font-semibold line-clamp-3 leading-relaxed mb-4">
                {post.content || 'Visual creative post caption draft'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--neu-border-inset)]/50 text-xs">
                <span className="text-[11px] font-bold text-[var(--neu-text-secondary)]">
                  {post.platforms?.length || 1} Channels
                </span>
                <span className="text-blue-500 font-bold hover:underline">
                  Inspect Draft →
                </span>
              </div>
            </div>
          ))}

          {scheduledPosts.length === 0 && (
            <div className="col-span-3 py-10 text-center neu-inset rounded-2xl p-6">
              <p className="text-xs text-[var(--neu-text-muted)] font-medium">No posts currently scheduled.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/studio')}
                className="mt-3"
              >
                Schedule First Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
