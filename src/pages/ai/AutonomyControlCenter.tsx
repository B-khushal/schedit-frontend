import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Clock,
  Sparkles,
  Calendar,
  AlertOctagon,
  RefreshCw,
  Zap,
  HelpCircle,
  X,
  Check,
  Send,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, Modal } from '../../components/ui';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  cronSchedule: string;
  isEnabled: boolean;
  steps: string[];
  executions?: any[];
  updatedAt: string;
}

export function AutonomyControlCenter() {
  const { currentProject } = useWorkspace();
  const { success, error } = useToast();

  const [autonomySetting, setAutonomySetting] = useState<any | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mode change confirmation modal
  const [modeConfirmModal, setModeConfirmModal] = useState<{
    open: boolean;
    pendingMode: string | null;
  }>({ open: false, pendingMode: null });

  // Workflow configure drawer / modal
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const fetchAutonomyData = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);
    try {
      const [settingRes, workflowsRes] = await Promise.all([
        apiRequest(`/api/v1/projects/${currentProject.id}/ai/autonomy`),
        apiRequest(`/api/v1/projects/${currentProject.id}/ai/workflows`),
      ]);
      setAutonomySetting(settingRes);
      setWorkflows(workflowsRes || []);
    } catch (err: any) {
      console.warn('Failed to fetch autonomy configuration:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchAutonomyData();
  }, [fetchAutonomyData]);

  const handleSelectMode = (newMode: string) => {
    if (newMode === autonomySetting?.mode) return;
    setModeConfirmModal({ open: true, pendingMode: newMode });
  };

  const confirmModeChange = async () => {
    if (!currentProject?.id || !modeConfirmModal.pendingMode) return;
    const targetMode = modeConfirmModal.pendingMode;
    try {
      const updated = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/autonomy`, {
        method: 'PATCH',
        body: JSON.stringify({
          mode: targetMode,
          autoPublishOrganic: targetMode === 'AUTONOMOUS' || targetMode === 'SEMI_AUTONOMOUS',
        }),
      });
      setAutonomySetting(updated);
      success(
        'Autonomy Mode Updated',
        `Marketing OS is now running in ${targetMode.replace('_', ' ')} mode.`,
      );
      setModeConfirmModal({ open: false, pendingMode: null });
    } catch (err: any) {
      error('Failed to change mode', err.message);
    }
  };

  const handleToggleWorkflow = async (wf: WorkflowItem) => {
    if (!currentProject?.id) return;
    try {
      const nextState = !wf.isEnabled;
      await apiRequest(`/api/v1/projects/${currentProject.id}/ai/workflows/${wf.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: nextState }),
      });
      setWorkflows((prev) =>
        prev.map((item) => (item.id === wf.id ? { ...item, isEnabled: nextState } : item)),
      );
      success(
        nextState ? 'Workflow Activated' : 'Workflow Paused',
        `"${wf.name}" has been ${nextState ? 'enabled' : 'paused'}.`,
      );
    } catch (err: any) {
      error('Failed to toggle workflow', err.message);
    }
  };

  const handleSaveWorkflowConfig = async () => {
    if (!currentProject?.id || !editingWorkflow) return;
    setIsSavingWorkflow(true);
    try {
      const updated = await apiRequest(
        `/api/v1/projects/${currentProject.id}/ai/workflows/${editingWorkflow.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: editingWorkflow.name,
            description: editingWorkflow.description,
            cronSchedule: editingWorkflow.cronSchedule,
            isEnabled: editingWorkflow.isEnabled,
          }),
        },
      );
      setWorkflows((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      success('Configuration Saved', `Updated workflow settings for "${editingWorkflow.name}".`);
      setEditingWorkflow(null);
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  const handleTestRunWorkflow = async (workflowId: string) => {
    if (!currentProject?.id) return;
    setIsTestRunning(true);
    try {
      const res = await apiRequest(
        `/api/v1/projects/${currentProject.id}/ai/workflows/${workflowId}/test-run`,
        { method: 'POST' },
      );
      success('Test Run Complete (Safe Dry-Run)', res.message);
      fetchAutonomyData();
    } catch (err: any) {
      error('Dry Run Failed', err.message);
    } finally {
      setIsTestRunning(false);
    }
  };

  const activeCount = workflows.filter((w) => w.isEnabled).length;
  const pausedCount = workflows.length - activeCount;

  const modeDescriptions: Record<string, { title: string; subtitle: string; canDo: string[]; requiresApproval: string[]; risk: string }> = {
    MANUAL: {
      title: 'Manual Co-Pilot',
      subtitle: 'AI assists on-demand only. No scheduled actions or autonomous publishing.',
      canDo: ['Suggest marketing angles', 'Draft captions and creative briefs', 'Analyze historical analytics on request'],
      requiresApproval: ['Every single creation, plan, and schedule', 'All publishing operations', 'All advertising actions'],
      risk: 'Zero Autonomous Risk',
    },
    ASSISTED: {
      title: 'Assisted Mode',
      subtitle: 'AI independently generates daily strategies and drafts, but requires human sign-off before scheduling.',
      canDo: ['Automatically conduct market research', 'Create daily content plans & creative drafts', 'Monitor ad performance and generate optimization alerts'],
      requiresApproval: ['Scheduling and publishing organic posts', 'Creating Meta ad drafts', 'Modifying ad budgets'],
      risk: 'Very Low Risk (Full Human Review)',
    },
    SEMI_AUTONOMOUS: {
      title: 'Semi-Autonomous (Recommended)',
      subtitle: 'AI plans, creates, and schedules organic content. Financial changes and high-risk actions require human sign-off.',
      canDo: ['Research trends and upcoming holidays', 'Autonomously schedule QA-validated organic posts', 'Draft Meta campaigns within budget caps', 'Pause underperforming ads automatically'],
      requiresApproval: ['Launching new paid ad campaigns', 'Increasing daily ad budgets above thresholds', 'Major strategy theme changes'],
      risk: 'Balanced Efficiency with Financial Guardrails',
    },
    AUTONOMOUS: {
      title: 'Fully Autonomous',
      subtitle: 'AI independently manages the complete marketing loop within hard financial guardrails.',
      canDo: ['End-to-end research, creative generation, QA, and scheduled publishing', 'Autonomous ad campaign drafting and bid optimization', 'Continuous closed-loop learning from analytics'],
      requiresApproval: ['Only actions that violate hard daily or monthly financial caps', 'Emergency override only'],
      risk: 'Highest Velocity within Configured Spending Limits',
    },
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Top Title Banner */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-600" />
          Autonomy & Automation Control Center
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Configure how independently SchedIt executes your daily marketing operations, publishing pipelines, and advertising guardrails.
        </p>
      </div>

      {/* 4 Autonomy Mode Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-[11px]">
            1. Autonomous Operating Mode
          </h3>
          <span className="text-xs text-gray-500">
            Currently Active: <strong className="text-brand-600">{autonomySetting?.mode?.replace('_', ' ') || 'Semi-Autonomous'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['MANUAL', 'ASSISTED', 'SEMI_AUTONOMOUS', 'AUTONOMOUS'] as const).map((mode) => {
            const isCurrent = autonomySetting?.mode === mode;
            const info = modeDescriptions[mode];

            return (
              <div
                key={mode}
                onClick={() => handleSelectMode(mode)}
                className={cn(
                  "relative rounded-3xl p-5 neu-card transition-all cursor-pointer flex flex-col justify-between select-none",
                  isCurrent
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'hover:scale-[1.01]'
                )}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider neu-button-primary text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="pr-12">
                    <h4 className="text-sm font-extrabold text-[var(--neu-text-primary)]">{info.title}</h4>
                    <p className="text-xs text-[var(--neu-text-secondary)] mt-1 leading-relaxed">{info.subtitle}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--neu-border-inset)]/50 text-[11px]">
                    <div>
                      <span className="font-bold text-emerald-600 block">AI Independently Executes:</span>
                      <ul className="list-disc list-inside text-[var(--neu-text-secondary)] space-y-0.5 mt-0.5">
                        {info.canDo.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-amber-600 block">Requires Human Review:</span>
                      <ul className="list-disc list-inside text-[var(--neu-text-secondary)] space-y-0.5 mt-0.5">
                        {info.requiresApproval.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--neu-border-inset)]/50 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--neu-text-muted)] font-bold">{info.risk}</span>
                  <button
                    type="button"
                    className={`text-xs font-extrabold ${isCurrent ? 'text-blue-500' : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'}`}
                  >
                    {isCurrent ? 'Selected' : 'Switch Mode'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automation Pipeline Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card rounded-2xl p-4">
          <div className="text-xs text-[var(--neu-text-secondary)] font-bold">Active Workflows</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount} of {workflows.length}</div>
          <div className="text-[10px] text-[var(--neu-text-muted)] mt-0.5 font-medium">Running per schedule</div>
        </div>
        <div className="neu-card rounded-2xl p-4">
          <div className="text-xs text-[var(--neu-text-secondary)] font-bold">Paused Workflows</div>
          <div className="text-2xl font-black text-[var(--neu-text-primary)] mt-1">{pausedCount}</div>
          <div className="text-[10px] text-[var(--neu-text-muted)] mt-0.5 font-medium">Manual trigger available</div>
        </div>
        <div className="neu-card rounded-2xl p-4">
          <div className="text-xs text-[var(--neu-text-secondary)] font-bold">Next Scheduled Run</div>
          <div className="text-base sm:text-lg font-extrabold text-[var(--neu-text-primary)] mt-1 truncate">08:00 UTC Tomorrow</div>
          <div className="text-[10px] text-[var(--neu-text-muted)] mt-0.5 font-medium">Daily Marketing Cycle</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs text-gray-500 font-semibold">Dry-Run Test Safety</div>
          <div className="text-lg font-bold text-brand-600 mt-1">Guaranteed Dry-Run</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Zero external API dispatch</div>
        </div>
      </div>

      {/* 7 Workflow Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-[11px]">
              2. Configured Automation Workflows
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Each autonomous task can be individually enabled, scheduled, tested, or customized.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => {
            const lastExecution = wf.executions?.[0];
            return (
              <div
                key={wf.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${wf.isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <h4 className="text-sm font-bold text-gray-900 truncate">{wf.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{wf.description}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={wf.isEnabled}
                        onChange={() => handleToggleWorkflow(wf)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Cron: <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono">{wf.cronSchedule}</code></span>
                    </div>

                    {lastExecution && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Last Run: {format(new Date(lastExecution.startedAt), 'MMM d, h:mm a')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleTestRunWorkflow(wf.id)}
                    isLoading={isTestRunning}
                    icon={<Play className="w-3 h-3" />}
                    className="text-xs text-brand-600 hover:text-brand-800"
                  >
                    Test Run (Dry-Run)
                  </Button>

                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setEditingWorkflow(wf)}
                    icon={<Settings className="w-3 h-3" />}
                    className="text-xs"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode Change Confirmation Modal with Permission Diff */}
      {modeConfirmModal.open && modeConfirmModal.pendingMode && (
        <Modal
          open={modeConfirmModal.open}
          onClose={() => setModeConfirmModal({ open: false, pendingMode: null })}
          title={`Confirm Transition to ${modeConfirmModal.pendingMode.replace('_', ' ')} Mode`}
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              You are about to switch the workspace autonomy policy. Review the operational permission changes below before confirming:
            </p>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-gray-800 pb-1 border-b border-gray-200">
                <span>Capability / Action</span>
                <span>Permission Policy</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Organic Content Creation:</span>
                <span className="font-semibold text-emerald-600">Autonomous</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Publishing to Social Channels:</span>
                <span className="font-semibold text-gray-900">
                  {modeConfirmModal.pendingMode === 'AUTONOMOUS'
                    ? 'Autonomous without review'
                    : modeConfirmModal.pendingMode === 'SEMI_AUTONOMOUS'
                    ? 'Autonomous for organic'
                    : 'Requires Human Approval'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Meta Ad Campaign Creation:</span>
                <span className="font-semibold text-amber-700">
                  {modeConfirmModal.pendingMode === 'AUTONOMOUS'
                    ? 'Within hard daily caps'
                    : 'Requires Human Approval'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Emergency Kill-Switch:</span>
                <span className="font-semibold text-emerald-600">Active & Ready</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModeConfirmModal({ open: false, pendingMode: null })}
              >
                Cancel
              </Button>
              <Button variant="brand" size="sm" onClick={confirmModeChange}>
                Confirm & Apply Mode
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Workflow Configuration Drawer / Modal */}
      {editingWorkflow && (
        <Modal
          open={!!editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          title={`Configure: ${editingWorkflow.name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Workflow Title</label>
              <input
                type="text"
                value={editingWorkflow.name}
                onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Description & Objective</label>
              <textarea
                value={editingWorkflow.description || ''}
                onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 min-h-[70px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Execution Schedule (Cron Expression)</label>
              <input
                type="text"
                value={editingWorkflow.cronSchedule}
                onChange={(e) => setEditingWorkflow({ ...editingWorkflow, cronSchedule: e.target.value })}
                className="w-full text-xs p-2.5 font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Standard 5-part cron syntax (e.g. <code>0 8 * * *</code> for 8:00 AM daily).</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Workflow Active Status</span>
                <span className="text-[11px] text-gray-500">Enable or pause this autonomous background job.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingWorkflow.isEnabled}
                  onChange={(e) => setEditingWorkflow({ ...editingWorkflow, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestRunWorkflow(editingWorkflow.id)}
                isLoading={isTestRunning}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Safe Dry-Run
              </Button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingWorkflow(null)}>
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleSaveWorkflowConfig}
                  isLoading={isSavingWorkflow}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

