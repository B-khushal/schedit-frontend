import React, { useState, useEffect } from 'react';
import { Bell, Check, Loader2, MailOpen } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { PageHeader, Card, Button } from '../../components/ui';
import { format } from 'date-fns';

interface ClientNotification {
  id: string;
  title: string;
  message: string;
  eventType: string;
  read: boolean;
  createdAt: string;
}

export function ClientNotifications() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await clientApiRequest<ClientNotification[]>('/api/v1/clients/me/notifications');
        setNotifications(result);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await clientApiRequest(`/api/v1/clients/me/notifications/${id}/read`, {
        method: 'PATCH',
      });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <PageHeader
        title="Notifications"
        description="Stay updated with content review requests, comments, and approvals."
      />

      <div className="space-y-3 mt-4">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 border border-gray-200/85 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
              !n.read ? 'bg-brand-50/10 border-brand-100/60' : 'bg-white'
            }`}
          >
            <div className="flex gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.read ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-2">
                  {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>
            </div>

            {!n.read && (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleMarkAsRead(n.id)}
                icon={<Check className="w-3.5 h-3.5" />}
                className="shrink-0 w-full sm:w-auto"
              >
                Mark Read
              </Button>
            )}
          </Card>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl">
            <MailOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">No Notifications</h3>
            <p className="text-gray-500 text-sm font-medium">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ClientNotifications;
