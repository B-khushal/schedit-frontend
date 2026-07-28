import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw, Trash2, MailOpen } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button, PageHeader, EmptyState, Avatar } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';

export function Notifications() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await apiRequest('/api/v1/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications page details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toastSuccess('Notification read', 'Marked item as read.');
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update notification state.');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      setRefreshing(true);
      await Promise.all(unread.map(n => apiRequest(`/api/v1/notifications/${n.id}/read`, { method: 'PATCH' })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toastSuccess('All read', 'Marked all unread notifications as read.');
    } catch (err: any) {
      toastError('Bulk Action Failed', err.message || 'Could not mark all as read.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full space-y-8 animate-fade-in bg-transparent text-left">
      <PageHeader
        title="Notifications Center"
        description="Verify status triggers, approval revisions, comments, and oauth reconnect failures."
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={notifications.filter(n => !n.read).length === 0}
              icon={<MailOpen className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchNotifications}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync
            </Button>
          </div>
        }
      />

      <div className="flex gap-4 border-b border-gray-200 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "pb-3 text-sm font-bold transition-all relative cursor-pointer",
            filter === 'all' ? "text-brand-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          All
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "pb-3 text-sm font-bold transition-all relative cursor-pointer",
            filter === 'unread' ? "text-brand-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Unread
          {filter === 'unread' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden divide-y divide-gray-150">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading updates...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="Clean Notifications Center"
            description="You don't have any pending alerts or activities."
            className="py-16"
          />
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "p-4 flex gap-4 transition-all relative hover:bg-gray-50/50",
                !n.read ? "bg-brand-50/[0.03]" : ""
              )}
            >
              <div className="shrink-0 mt-0.5">
                {n.eventType?.includes('fail') ? (
                  <div className="p-2 bg-red-50 rounded-xl border border-red-100 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 bg-brand-50 rounded-xl border border-brand-100 text-brand-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h4 className="font-bold text-gray-900 text-sm sm:truncate">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="shrink-0 self-center"
                >
                  Mark read
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default Notifications;
