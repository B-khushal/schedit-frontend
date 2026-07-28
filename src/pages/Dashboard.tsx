import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Users, TrendingUp, Calendar as CalendarIcon, Clock, ArrowUpRight, Plus, Sparkles, AlertCircle, RefreshCw, BarChart3, Star, CheckCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Button, KPICard, MiniStat, SkeletonDashboard, EmptyState, Avatar, Badge, PageHeader } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { currentProject, isLoading: workspaceLoading } = useWorkspace();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [postPerformance, setPostPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      // Run api calls in parallel for optimal responsiveness
      const [postsList, timelineList, analyticsList, performanceList] = await Promise.all([
        apiRequest(`/api/v1/projects/${currentProject.id}/posts`),
        apiRequest(`/api/v1/projects/${currentProject.id}/timeline`),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/accounts`),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/posts`),
      ]);

      setPosts(postsList);
      setTimeline(timelineList.slice(0, 5)); // Keep last 5 events
      setAnalytics(analyticsList);
      setPostPerformance(performanceList.slice(0, 3)); // Top 3 posts
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

  // Filter and compute active post counts
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED');
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  const pendingReviews = posts.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'REVIEW');
  const awaitingClient = posts.filter(p => p.status === 'CLIENT_REVIEW');
  const changesRequested = posts.filter(p => p.status === 'CHANGES_REQUESTED' || p.status === 'CLIENT_CHANGES_REQUESTED');
  const failedPosts = posts.filter(p => p.status === 'FAILED');

  // Aggregated follower counters
  const totalFollowers = currentProject.socialAccounts?.reduce((acc: number, item: any) => acc + (item.followerCount || 0), 0) || 0;

  // Chart data calculations
  const chartData = analytics.length > 0
    ? analytics.map((stat: any) => ({
        name: format(new Date(stat.date), 'MMM dd'),
        impressions: stat.impressions || 0,
        reach: stat.reach || 0,
      })).slice(-7) // Last 7 data points
    : [
        { name: 'Mon', impressions: 0, reach: 0 },
        { name: 'Tue', impressions: 0, reach: 0 },
        { name: 'Wed', impressions: 0, reach: 0 },
        { name: 'Thu', impressions: 0, reach: 0 },
        { name: 'Fri', impressions: 0, reach: 0 },
        { name: 'Sat', impressions: 0, reach: 0 },
        { name: 'Sun', impressions: 0, reach: 0 },
      ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full animate-fade-in bg-transparent">
      {/* Header component */}
      <PageHeader
        title="Executive Overview"
        description={`Aggregated social performance & scheduling analytics for ${currentProject.name}.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadDashboardData}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync data
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app/studio')}
              icon={<Plus className="w-4 h-4" />}
            >
              Compose Post
            </Button>
          </div>
        }
      />

      {/* Review & Approvals status counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniStat label="Pending review" value={pendingReviews.length} color="bg-amber-500" />
        <MiniStat label="Awaiting Client" value={awaitingClient.length} color="bg-indigo-500" />
        <MiniStat label="Changes Requested" value={changesRequested.length} color="bg-orange-500" />
        <MiniStat label="Failed Publishing" value={failedPosts.length} color="bg-red-500" />
        <MiniStat label="Scheduled Content" value={scheduledPosts.length} color="bg-brand-500" />
        <MiniStat label="Published Content" value={publishedPosts.length} color="bg-emerald-500" />
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Connected accounts"
          value={currentProject.socialAccounts?.length || 0}
          icon={<Users className="w-5 h-5" />}
          trend="Healthy Connections"
          trendUp={true}
        />
        <KPICard
          label="Total followers reach"
          value={totalFollowers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend="Real-time Audited"
          trendUp={true}
        />
        <KPICard
          label="Active Campaign Projects"
          value={currentProject.status === 'ACTIVE' ? '1 Active' : '0 Active'}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="Status OK"
          trendUp={true}
        />
        <KPICard
          label="Pending publication queue"
          value={scheduledPosts.length + pendingReviews.length + awaitingClient.length}
          icon={<Clock className="w-5 h-5" />}
          trend="Next 7 Days"
          trendUp={true}
        />
      </div>

      {/* Recharts Analytics chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">Workspace Reach Growth</h2>
              <p className="text-xs text-gray-500 mt-0.5">Aggregated impressions and reach stats across platforms.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span> Impressions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Reach
              </span>
            </div>
          </div>
          <div className="h-[200px] sm:h-[260px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#f3f4f6' }}
                  itemStyle={{ color: '#a78bfa', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorImpressions)" />
                <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit timeline & activities */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Recent Activities</h2>
            <p className="text-xs text-gray-500 mt-0.5 mb-6">Collaboration logs and schedule events tracker.</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[260px] pr-1 scrollbar-hide">
            {timeline.map((log: any) => (
              <div key={log.id} className="flex gap-3 text-xs leading-normal items-start">
                <Avatar src={log.user?.avatarUrl} name={log.user?.name} size="xs" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-gray-800 font-semibold">{log.details}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {format(new Date(log.createdAt), 'MMM dd, h:mm a')} • {log.user?.name}
                  </p>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-12 font-medium">No activity log found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top performing posts list */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Top Performing Content
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Highest reach social posts list.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')} className="text-brand-600 font-bold hover:text-brand-700">
            View Reports
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {postPerformance.map((stat: any, idx: number) => {
            const post = stat.scheduledPostPlatform?.scheduledPost || {};
            const account = stat.scheduledPostPlatform?.socialAccount || {};
            return (
              <div key={stat.id || idx} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all bg-gray-50/50 group cursor-pointer" onClick={() => navigate('/app/workflow')}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-500 capitalize">{account.platform?.slice(0, 2) || 'X'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">@{account.username || 'username'}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed font-semibold">
                      {post.content || 'Content not loaded'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200/60 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Likes</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{stat.likes || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Shares</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{stat.shares || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Clicks</p>
                    <p className="text-xs font-bold text-brand-600 mt-0.5">{stat.clicks || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {postPerformance.length === 0 && (
            <div className="col-span-3 py-8 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
              No top performing posts data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
