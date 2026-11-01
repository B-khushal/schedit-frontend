import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertOctagon,
  Clock,
  CheckCircle,
  Lock,
  Layers,
  Megaphone,
  Save,
  Check,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '../../components/ui';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface AutonomySettingsViewProps {
  projectId: string;
  onRefreshDashboard: () => void;
}

export function AutonomySettingsView({ projectId, onRefreshDashboard }: AutonomySettingsViewProps) {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/v1/projects/${projectId}/ai/autonomy`);
      setSettings(data);
    } catch (err: any) {
      error('Failed to load autonomy settings', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSettings();
    }
  }, [projectId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/autonomy`, {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      success('Autonomy Settings Saved', 'Execution governance updated.');
      onRefreshDashboard();
    } catch (err: any) {
      error('Failed to update settings', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEmergencyStop = async () => {
    const nextState = !settings.emergencyStop;
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/emergency-stop`, {
        method: 'POST',
        body: JSON.stringify({
          enable: nextState,
          reason: nextState ? 'Emergency Stop triggered by administrator' : null,
        }),
      });
      setSettings({ ...settings, emergencyStop: nextState });
      success(
        nextState ? 'Emergency Stop Activated' : 'Emergency Stop Cleared',
        nextState ? 'All automated AI actions halted.' : 'AI operations resumed.',
      );
      onRefreshDashboard();
    } catch (err: any) {
      error('Failed to toggle emergency stop', err.message);
    }
  };

  if (!settings) return null;

  const modes = [
    {
      id: 'MANUAL',
      name: 'Mode 1 — Manual',
      description: 'AI generates suggestions and drafts. Humans manually execute all approvals and publishing.',
    },
    {
      id: 'ASSISTED',
      name: 'Mode 2 — Assisted',
      description: 'AI generates and prepares scheduled posts, but all items require human sign-off before going live.',
    },
    {
      id: 'SEMI_AUTONOMOUS',
      name: 'Mode 3 — Semi-Autonomous',
      description: 'AI autonomously creates, validates, and publishes approved organic content. Paid campaigns require approval.',
    },
    {
      id: 'AUTONOMOUS',
      name: 'Mode 4 — Autonomous',
      description: 'AI independently plans, creates, schedules, publishes, monitors, and optimizes within hard financial guardrails.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--neu-text-primary)] font-display flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <Shield className="w-4 h-4" />
            </div>
            Autonomy & Approval Governance
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Configure how independently the AI operates, set execution schedules, and control safety stops.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          loading={isSaving}
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          Save Autonomy Policies
        </Button>
      </div>

      {/* Emergency Stop Module */}
      <div className={cn(
        "p-6 rounded-2xl transition-all duration-300",
        settings.emergencyStop
          ? 'neu-inset border-2 border-red-500 bg-red-500/10'
          : 'neu-card'
      )}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              settings.emergencyStop ? 'neu-raised bg-red-600 text-white animate-pulse' : 'neu-well text-red-500'
            )}>
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--neu-text-primary)]">
                {settings.emergencyStop ? 'EMERGENCY STOP IS ENGAGED' : 'Master Emergency Stop'}
              </h3>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Immediately blocks all AI-triggered external publishing and pauses active ad changes without deleting data.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEmergencyStop}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              settings.emergencyStop
                ? 'neu-button bg-emerald-600 text-white hover:bg-emerald-700'
                : 'neu-raised text-red-600 hover:text-red-700'
            )}
          >
            {settings.emergencyStop ? 'Deactivate Emergency Stop' : 'Activate Emergency Stop'}
          </button>
        </div>
      </div>

      {/* 4 Autonomy Operating Modes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--neu-text-primary)] font-display">Operating Autonomy Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((m) => {
            const isSelected = settings.mode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSettings({ ...settings, mode: m.id })}
                className={cn(
                  "p-5 rounded-2xl cursor-pointer transition-all duration-200 select-none",
                  isSelected
                    ? 'neu-inset border-2 border-blue-500/60 bg-blue-500/5'
                    : 'neu-raised hover:neu-raised-lg'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--neu-text-primary)]">{m.name}</span>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full neu-well" />
                  )}
                </div>
                <p className="text-xs text-[var(--neu-text-secondary)] leading-relaxed">{m.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Schedule & Volume Limits */}
      <div className="neu-card p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--neu-text-primary)]">Daily Schedule & Publishing Limits</h3>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">Configure when the daily marketing cycle executes and maximum post volumes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Daily Execution Time</label>
            <input
              type="time"
              value={settings.dailyExecutionTime || '08:00'}
              onChange={(e) => setSettings({ ...settings, dailyExecutionTime: e.target.value })}
              className="neu-input w-full px-3.5 py-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Timezone</label>
            <input
              type="text"
              value={settings.timezone || 'UTC'}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="neu-input w-full px-3.5 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Max Posts Per Day</label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxPostsPerDay || 2}
              onChange={(e) => setSettings({ ...settings, maxPostsPerDay: Number(e.target.value) })}
              className="neu-input w-full px-3.5 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Detailed Granular Permission Toggles */}
      <div className="neu-card p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--neu-text-primary)]">Autonomous Action Permissions</h3>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">Grant or restrict specific capabilities to the AI system</p>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
          {[
            {
              key: 'autoPublishOrganic',
              label: 'Auto-Publish Organic Content',
              desc: 'Allow AI to publish validated organic posts directly when in autonomous mode.',
            },
            {
              key: 'autoScheduleContent',
              label: 'Auto-Schedule Approved Posts',
              desc: 'Allow AI to enqueue posts into BullMQ queue at recommended peak times.',
            },
            {
              key: 'autoCreateCampaignDrafts',
              label: 'Auto-Draft Ad Campaigns',
              desc: 'Allow AI to formulate Meta advertising drafts based on active products and goals.',
            },
            {
              key: 'autoPauseUnderperformingAds',
              label: 'Auto-Pause Low-ROAS Campaigns',
              desc: 'Allow AI to automatically pause campaigns that drop below your minimum ROAS threshold.',
            },
            {
              key: 'autoModifyBudgets',
              label: 'Auto-Adjust Campaign Budgets',
              desc: 'Allow AI to optimize ad budgets up to the max permitted 20% limit.',
            },
          ].map((toggle) => {
            const isChecked = settings[toggle.key] || false;
            return (
              <div key={toggle.key} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[var(--neu-text-primary)]">{toggle.label}</p>
                  <p className="text-[var(--neu-text-secondary)] mt-0.5">{toggle.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, [toggle.key]: !isChecked })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all duration-200 relative shrink-0 p-0.5 cursor-pointer",
                    isChecked ? "neu-button-primary bg-blue-600" : "neu-well bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-sm",
                      isChecked ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
