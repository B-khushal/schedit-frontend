import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ClipboardCheck, CheckCircle2, XCircle, CalendarClock, Activity, Bell, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { KPICard, Card, Badge, Avatar, Button } from '../../components/ui';
import { format } from 'date-fns';

interface DashboardData {
  stats: { pendingReviews: number; approved: number; rejected: number; scheduled: number };
  projects: any[];
  upcomingPosts: any[];
  recentActivity: any[];
  notifications: any[];
}

export function ClientDashboard() {
  const { user, client } = useClientAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await clientApiRequest<DashboardData>('/api/v1/clients/me/dashboard');
        setData(result);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { pendingReviews: 0, approved: 0, rejected: 0, scheduled: 0 };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Client'} 👋
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">
          Here's an overview of your projects and content awaiting review.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Pending Reviews"
          value={stats.pendingReviews}
          icon={<ClipboardCheck className="w-5 h-5" />}
          trend={stats.pendingReviews > 0 ? 'needs attention' : 'all clear'}
          trendUp={stats.pendingReviews === 0}
          className={stats.pendingReviews > 0 ? 'border-amber-200 bg-amber-50/10' : ''}
        />
        <KPICard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle2 className="w-5 h-5" />}
          className={stats.approved > 0 ? 'border-emerald-250 bg-emerald-50/10' : ''}
        />
        <KPICard
          label="Rejected / Changes"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          className={stats.rejected > 0 ? 'border-red-200 bg-red-50/10' : ''}
        />
        <KPICard
          label="Scheduled"
          value={stats.scheduled}
          icon={<CalendarClock className="w-5 h-5" />}
          className={stats.scheduled > 0 ? 'border-blue-200 bg-blue-50/10' : ''}
        />
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-display">Your Projects</h2>
          <Link to="/client/projects">
            <Button variant="secondary" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.projects || []).map((project) => (
            <Link key={project.id} to={`/client/projects/${project.id}`}>
              <Card className="p-5 hover:shadow-elevated hover:border-brand-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                    <FolderOpen className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{project.postCount} posts</p>
                  </div>
                </div>
                <Badge variant={project.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                  {project.status}
                </Badge>
              </Card>
            </Link>
          ))}
          {(data?.projects || []).length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No projects assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Two-column: Upcoming + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-brand-500" />
            Upcoming Scheduled
          </h3>
          <div className="space-y-3">
            {(data?.upcomingPosts || []).slice(0, 5).map((post: any) => (
              <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{post.content?.substring(0, 50) || 'Scheduled post'}...</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {format(new Date(post.scheduledTime), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <Badge variant="info" className="shrink-0">{post.status}</Badge>
              </div>
            ))}
            {(data?.upcomingPosts || []).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No upcoming posts</p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(data?.recentActivity || []).slice(0, 6).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3">
                <Avatar src={log.user?.avatarUrl} name={log.user?.name || 'User'} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{log.user?.name}</span>{' '}
                    <span className="text-gray-500">{log.action?.toLowerCase()}</span>
                  </p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5 truncate">{log.details}</p>}
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {format(new Date(log.createdAt), 'MMM d · h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            {(data?.recentActivity || []).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default ClientDashboard;
