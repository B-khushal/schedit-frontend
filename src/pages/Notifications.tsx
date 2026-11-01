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
    <div className="p-4 sm:p-6 md:p-8 max-w-[850px] mx-auto w-full space-y-6 sm:space-y-8 animate-fade-in text-[var(--neu-text-primary)]">
      <PageHeader
        title="Notifications Center"
        description="Verify status triggers, approval revisions, comments, and oauth reconnect failures."
        actions={
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
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

      {/* Neumorphic Segmented Tab Switch */}
      <div className="flex neu-well p-1 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer select-none",
            filter === 'all' ? "neu-button-primary text-white shadow-xs" : "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]"
          )}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer select-none",
            filter === 'unread' ? "neu-button-primary text-white shadow-xs" : "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]"
          )}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      <div className="neu-card rounded-3xl overflow-hidden divide-y divide-[var(--neu-border-inset)]/50">
        {loading ? (
          <div className="p-12 text-center text-[var(--neu-text-muted)] font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> Loading updates...
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
                "p-4 sm:p-5 flex gap-4 transition-all relative hover:bg-black/5 dark:hover:bg-white/5",
                !n.read ? "neu-inset-sm my-1 mx-2 rounded-2xl border-l-4 border-l-blue-500" : ""
              )}
            >
              <div className="shrink-0 mt-0.5">
                {n.eventType?.includes('fail') ? (
                  <div className="p-2.5 neu-inset-sm rounded-xl text-rose-500">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2.5 neu-inset-sm rounded-xl text-blue-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h4 className="font-extrabold text-[var(--neu-text-primary)] text-sm sm:truncate">{n.title}</h4>
                  <span className="text-[10px] text-[var(--neu-text-muted)] font-bold whitespace-nowrap">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-[var(--neu-text-secondary)] font-medium mt-1 leading-relaxed">{n.message}</p>
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
