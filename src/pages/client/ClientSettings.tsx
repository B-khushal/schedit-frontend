import React, { useState } from 'react';
import { Bell, Globe, Sparkles } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { PageHeader, Card, Button } from '../../components/ui';

export function ClientSettings() {
  const { success: toastSuccess } = useToast();
  const [emailNotify, setEmailNotify] = useState(true);
  const [inAppNotify, setInAppNotify] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toastSuccess('Settings Saved', 'Your preference changes have been updated.');
    }, 600);
  };

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <PageHeader
        title="Portal Settings"
        description="Configure your review preferences and regional localizations."
      />

      <form onSubmit={handleSave} className="space-y-6 mt-4">
        {/* Notifications */}
        <Card className="p-4 sm:p-6 border border-gray-200/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-brand-600" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Email Notifications</p>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  Receive email alerts when content requires your review or edit updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-sm font-bold text-gray-800">In-App Notifications</p>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  View comments and approvals directly in your dashboard notification feed.
                </p>
              </div>
              <input
                type="checkbox"
                checked={inAppNotify}
                onChange={(e) => setInAppNotify(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        {/* Localization */}
        <Card className="p-4 sm:p-6 border border-gray-200/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-brand-600" />
            Localization Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Display Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full max-w-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
export default ClientSettings;
