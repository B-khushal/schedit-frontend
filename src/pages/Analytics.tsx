import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, ArrowUpRight, BarChart2, Eye, Heart, MessageCircle, RefreshCw, Calendar, 
  LayoutGrid, Share2, Bookmark, Play, Video, ExternalLink, Filter, TrendingUp, Users, 
  ChevronRight, AlertCircle, FileText, Image as ImageIcon, Sparkles, Smartphone, Globe
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import { Button, PageHeader, KPICard, PlatformIcon } from '../components/ui';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { PlanGate } from '../components/plan/PlanGate';

const COLORS = ['#6366F1', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export function Analytics() {
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [overview, setOverview] = useState<any>(null);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [chartsData, setChartsData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'reels' | 'stories' | 'charts'>('overview');
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [drillDownItem, setDrillDownItem] = useState<any>(null);

  const fetchRealAnalytics = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      const startDate = new Date(Date.now() - parseInt(timeRange, 10) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const query = `startDate=${startDate}&endDate=${endDate}&platform=${selectedPlatform}&accountId=${selectedAccountId}`;

      const [overviewRes, feedRes, reelsRes, storiesRes, chartsRes] = await Promise.all([
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/overview?${query}`).catch(() => null),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/feed?${query}`).catch(() => []),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/reels?${query}`).catch(() => []),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/stories?${query}`).catch(() => []),
        apiRequest(`/api/v1/projects/${currentProject.id}/analytics/charts?${query}`).catch(() => null),
      ]);

      setOverview(overviewRes);
      setFeedPosts(feedRes || []);
      setReels(reelsRes || []);
      setStories(storiesRes || []);
      setChartsData(chartsRes);
    } catch (err: any) {
      console.error('Failed to load real analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchRealAnalytics();
    }
  }, [currentProject, timeRange, selectedPlatform, selectedAccountId]);

  const handleManualSync = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/analytics/sync`, { method: 'POST' });
      toastSuccess('Sync Initiated', 'Real account metrics synchronization triggered across social networks.');
      setTimeout(() => fetchRealAnalytics(), 2000);
    } catch (err: any) {
      toastError('Sync Failed', err.message);
      setRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (feedPosts.length === 0 && reels.length === 0) return toastWarning('Export Alert', 'No social analytics records available.');

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Platform,Type,Caption,PublishedAt,Likes,Comments,Shares,Saves,Reach,Impressions,EngagementRate,Permalink\n';

    [...feedPosts, ...reels].forEach((item) => {
      const escapedCaption = (item.caption || '').replace(/"/g, '""');
      const metrics = item.metrics || {};
      csvContent += `"${item.platform}","${item.postType}","${escapedCaption}","${item.publishedAt}",${metrics.likes || 0},${metrics.comments || 0},${metrics.shares || 0},${metrics.saves || 0},${metrics.reach || 0},${metrics.impressions || 0},${metrics.engagementRate || 0}%,"${item.permalink || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `real-analytics-${currentProject?.name || 'project'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('CSV Exported', 'Real analytics report downloaded successfully.');
  };

  return (
    <PlanGate
      requiredPlan="PROFESSIONAL"
      fallbackTitle="Enterprise Real Social Analytics (Professional Plan)"
      fallbackDescription="Access complete real-time social channel insights, Reels retention, and executive PDF/CSV exports."
    >
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full animate-fade-in bg-transparent text-left font-sans">
        <PageHeader
          title="Enterprise Real Analytics"
          description="Synchronized real-time performance insights directly from connected social platform APIs."
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualSync}
                loading={refreshing}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Real Analytics
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-4 h-4" />}
              >
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Global Filter Bar */}
        <div className="neu-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 text-[var(--neu-text-primary)]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 neu-inset-sm rounded-xl text-xs font-bold text-[var(--neu-text-secondary)]">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Filters:</span>
            </div>

            {/* Platform Filter */}
            <select
              className="px-3 py-1.5 neu-input rounded-xl text-xs font-bold text-[var(--neu-text-primary)] focus:outline-none cursor-pointer"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="all">All Platforms</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="YOUTUBE">YouTube</option>
            </select>

            {/* Account Filter */}
            <select
              className="px-3 py-1.5 neu-input rounded-xl text-xs font-bold text-[var(--neu-text-primary)] focus:outline-none cursor-pointer"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="all">All Connected Accounts</option>
              {currentProject?.socialAccounts?.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.platform} - @{acc.username}
                </option>
              ))}
            </select>

            {/* Time Range Filter */}
            <select
              className="px-3 py-1.5 neu-input rounded-xl text-xs font-bold text-[var(--neu-text-primary)] focus:outline-none cursor-pointer"
              value={timeRange}
              onChange={(e: any) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center p-1 neu-well rounded-2xl overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {(['overview', 'feed', 'reels', 'stories', 'charts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap shrink-0 cursor-pointer select-none',
                  activeTab === tab
                    ? 'neu-button-primary text-white shadow-xs'
                    : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview KPIs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Missing Insights Scope Warning */}
            {overview?.insightsScopeMissing && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold">Limited Insights Scope</p>
                  <p className="text-xs mt-0.5 text-amber-700">
                    Some connected accounts are missing the <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px] font-mono">instagram_manage_insights</code> permission. 
                    Reach, Impressions, and Profile Views data requires this scope. Disconnect and reconnect the account under <strong>Connected Apps</strong> to grant full analytics access. 
                    Engagement rate is currently calculated using follower count instead of reach.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <KPICard label="Total Reach" value={(overview?.totalReach || 0).toLocaleString()} icon={<Eye className="w-4 h-4" />} trend={overview?.totalReach > 0 ? 'Real API Data' : 'Needs Insights Scope'} trendUp={overview?.totalReach > 0} />
              <KPICard label="Total Impressions" value={(overview?.totalImpressions || 0).toLocaleString()} icon={<BarChart2 className="w-4 h-4" />} trend={overview?.totalImpressions > 0 ? 'Real API Data' : 'Needs Insights Scope'} trendUp={overview?.totalImpressions > 0} />
              <KPICard label="Total Engagement" value={(overview?.accountsEngaged || 0).toLocaleString()} icon={<Heart className="w-4 h-4" />} trend="Likes + Comments + Saves" trendUp={true} />
              <KPICard label="Total Followers" value={(overview?.totalFollowers || 0).toLocaleString()} icon={<Users className="w-4 h-4" />} trend="Real API Sync" trendUp={true} />
              <KPICard label="Engagement Rate" value={`${overview?.avgEngagementRate || 0}%`} icon={<TrendingUp className="w-4 h-4" />} trend={overview?.engagementRateMethod === 'reach' ? 'By Reach' : 'By Followers'} trendUp={true} />
              <KPICard label="Profile Visits" value={(overview?.profileVisits || 0).toLocaleString()} icon={<ArrowUpRight className="w-4 h-4" />} trend={overview?.profileVisits > 0 ? 'Real API Data' : 'Needs Insights Scope'} trendUp={overview?.profileVisits > 0} />
              <KPICard label="Website Clicks" value={(overview?.websiteClicks || 0).toLocaleString()} icon={<ExternalLink className="w-4 h-4" />} trend="Real API Sync" trendUp={true} />
              <KPICard label="Average Reach" value={(overview?.avgReach || 0).toLocaleString()} icon={<Eye className="w-4 h-4" />} trend="Per Post" trendUp={true} />
              <KPICard label="Average Likes" value={(overview?.avgLikes || 0).toLocaleString()} icon={<Heart className="w-4 h-4" />} trend="Per Post" trendUp={true} />
              <KPICard label="Average Comments" value={(overview?.avgComments || 0).toLocaleString()} icon={<MessageCircle className="w-4 h-4" />} trend="Per Post" trendUp={true} />
              <KPICard label="Average Shares" value={(overview?.avgShares || 0).toLocaleString()} icon={<Share2 className="w-4 h-4" />} trend="Per Post" trendUp={true} />
              <KPICard label="Average Saves" value={(overview?.avgSaves || 0).toLocaleString()} icon={<Bookmark className="w-4 h-4" />} trend="Per Post" trendUp={true} />
              <KPICard label="Average Video Views" value={(overview?.avgVideoViews || 0).toLocaleString()} icon={<Play className="w-4 h-4" />} trend="Per Video" trendUp={true} />
              <KPICard label="Average Watch Time" value={`${overview?.avgWatchTime || 0}s`} icon={<Video className="w-4 h-4" />} trend="Per Reel" trendUp={true} />
              <KPICard label="Published Media" value={`${overview?.totalPosts || 0} Posts`} icon={<ImageIcon className="w-4 h-4" />} trend="Synced Records" trendUp={true} />
            </div>

            {/* Primary Reach & Impression Timeline Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">Daily Reach & Impressions Trend</h3>
              {chartsData?.dailyTimeline?.length ? (
                <div className="h-48 sm:h-60 md:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartsData.dailyTimeline}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="reach" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" name="Reach" />
                      <Area type="monotone" dataKey="impressions" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorImp)" name="Impressions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs font-semibold">Analytics unavailable for this content.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Click "Refresh Real Analytics" above to synchronize connected account insights.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Feed Posts Analytics */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Feed Post Performance Cards</h3>
            {feedPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-800">Analytics unavailable for this content.</p>
                <p className="text-xs text-gray-500 mt-1">No feed posts published or synchronized yet from connected accounts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {feedPosts.map((post) => {
                  const m = post.metrics || {};
                  return (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-brand-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={post.platform} size="xs" />
                          <span className="text-xs font-bold text-gray-700 capitalize">{post.platform}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'Recently'}
                        </span>
                      </div>

                      <div className="flex gap-4">
                        {post.thumbnail ? (
                          <img src={post.thumbnail} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <p className="text-xs text-gray-800 font-medium line-clamp-3 leading-relaxed">
                          {post.caption || 'No caption available'}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Likes</p>
                          <p className="text-xs font-bold text-gray-900">{m.likes || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Comments</p>
                          <p className="text-xs font-bold text-gray-900">{m.comments || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Reach</p>
                          <p className="text-xs font-bold text-indigo-600">{(m.reach || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Rate</p>
                          <p className="text-xs font-bold text-emerald-600">{m.engagementRate || 0}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setDrillDownItem(post)}
                          className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {post.permalink && (
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 font-semibold hover:text-gray-900 flex items-center gap-1"
                          >
                            Open Original Post <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reels & Videos Analytics */}
        {activeTab === 'reels' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Reels & Shorts Analytics</h3>
            {reels.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-800">Analytics unavailable for this content.</p>
                <p className="text-xs text-gray-500 mt-1">No video reels or shorts synchronized from connected platforms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {reels.map((reel) => {
                  const m = reel.metrics || {};
                  return (
                    <div key={reel.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-purple-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {reel.postType}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {reel.publishedAt ? format(new Date(reel.publishedAt), 'MMM dd, yyyy') : ''}
                        </span>
                      </div>

                      <div className="flex gap-4">
                        {reel.thumbnail ? (
                          <img src={reel.thumbnail} alt="Cover" className="w-20 h-24 rounded-xl object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-20 h-24 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-400">
                            <Video className="w-8 h-8" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <p className="text-xs text-gray-800 font-semibold line-clamp-2">{reel.caption || 'Reel Video'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-bold">
                            <Play className="w-3.5 h-3.5 fill-purple-600" />
                            <span>{(m.videoViews || m.impressions || 0).toLocaleString()} Views</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Likes</p>
                          <p className="text-xs font-bold text-gray-900">{m.likes || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Reach</p>
                          <p className="text-xs font-bold text-purple-600">{(m.reach || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Shares</p>
                          <p className="text-xs font-bold text-gray-900">{m.shares || 0}</p>
                        </div>
                      </div>

                      {reel.permalink && (
                        <a
                          href={reel.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-700 font-bold hover:underline flex items-center justify-end gap-1 pt-2"
                        >
                          Open Original Reel <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Stories Analytics */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900">Instagram & Facebook Stories Analytics</h3>
            {stories.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-800">Analytics unavailable for this content.</p>
                <p className="text-xs text-gray-500 mt-1">No active stories found from connected accounts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {stories.map((story) => {
                  const sm = story.storyMetric || {};
                  return (
                    <div key={story.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          STORY
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {story.publishedAt ? format(new Date(story.publishedAt), 'HH:mm') : ''}
                        </span>
                      </div>

                      {story.thumbnail ? (
                        <img src={story.thumbnail} alt="Story" className="w-full h-44 rounded-xl object-cover border border-gray-100" />
                      ) : (
                        <div className="w-full h-44 rounded-xl bg-amber-50 flex items-center justify-center text-amber-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-[9px] text-gray-400 uppercase">Reach</p>
                          <p className="text-xs font-bold text-amber-600">{(sm.reach || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-[9px] text-gray-400 uppercase">Exits</p>
                          <p className="text-xs font-bold text-gray-900">{sm.exits || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-[9px] text-gray-400 uppercase">Taps Forward</p>
                          <p className="text-xs font-bold text-gray-900">{sm.tapsForward || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-[9px] text-gray-400 uppercase">Taps Back</p>
                          <p className="text-xs font-bold text-gray-900">{sm.tapsBack || 0}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Charts & Demographics */}
        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">Engagement & Likes Breakdown</h3>
              <div className="h-48 sm:h-56 md:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData?.dailyTimeline || []}>
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="likes" fill="#6366F1" radius={[4, 4, 0, 0]} name="Likes" />
                    <Bar dataKey="comments" fill="#EC4899" radius={[4, 4, 0, 0]} name="Comments" />
                    <Bar dataKey="shares" fill="#10B981" radius={[4, 4, 0, 0]} name="Shares" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">Platform Follower Distribution</h3>
              <div className="h-48 sm:h-56 md:h-64 w-full flex items-center justify-center">
                {chartsData?.platformDistribution?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartsData.platformDistribution} dataKey="followers" nameKey="platform" cx="50%" cy="50%" outerRadius={80} label>
                        {chartsData.platformDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-400">Analytics unavailable for this content.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drill-Down Detail Modal */}
        {drillDownItem && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={drillDownItem.platform} size="xs" />
                  <h3 className="text-base font-bold text-gray-900">{drillDownItem.postType} Performance Details</h3>
                </div>
                <button onClick={() => setDrillDownItem(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                  ×
                </button>
              </div>

              <div className="flex gap-4">
                {drillDownItem.thumbnail && (
                  <img src={drillDownItem.thumbnail} alt="Preview" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-relaxed line-clamp-4">
                    {drillDownItem.caption || 'No caption'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Published: {drillDownItem.publishedAt ? format(new Date(drillDownItem.publishedAt), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Reach</p>
                  <p className="text-sm font-bold text-indigo-600">{(drillDownItem.metrics?.reach || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Impressions</p>
                  <p className="text-sm font-bold text-pink-600">{(drillDownItem.metrics?.impressions || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Engagement</p>
                  <p className="text-sm font-bold text-emerald-600">{drillDownItem.metrics?.engagementRate || 0}%</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" size="sm" onClick={() => setDrillDownItem(null)}>
                  Close
                </Button>
                {drillDownItem.permalink && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.open(drillDownItem.permalink, '_blank')}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Original Platform Post
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
  );
}

export default Analytics;
