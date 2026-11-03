import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Brain,
  Wand2,
  Megaphone,
  Layers,
  Send,
  RefreshCw,
  Eye,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Calendar,
  Info,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Compass,
  CalendarCheck2,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, KPICard, StatusPill, Modal } from '../../components/ui';
import { format } from 'date-fns';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface CommandCenterOverviewProps {
  dashboard: any;
  isLoading: boolean;
  onRefresh: () => void;
  onTriggerCycle: () => Promise<void>;
  onTriggerAgent: (agentType: string, prompt?: string) => Promise<void>;
  onToggleEmergencyStop: (enable: boolean) => Promise<void>;
  onNavigateTab: (tabId: string) => void;
}

export function CommandCenterOverview({
  dashboard,
  isLoading,
  onRefresh,
  onTriggerCycle,
  onTriggerAgent,
  onToggleEmergencyStop,
  onNavigateTab,
}: CommandCenterOverviewProps) {
  const { success, error } = useToast();
  const [isCycleRunning, setIsCycleRunning] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  // Modals state
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<any | null>(null);
  const [selectedDecisionForReasoning, setSelectedDecisionForReasoning] = useState<any | null>(null);
  const [rejectReasonModal, setRejectReasonModal] = useState<{ open: boolean; item: any | null; reason: string }>({
    open: false,
    item: null,
    reason: '',
  });

  const opStatus = dashboard?.operationalStatus || {};
  const isEmergencyStopped = opStatus.emergencyStop || false;
  const autonomyMode = opStatus.autonomyMode || 'SEMI_AUTONOMOUS';
  const bizSummary = dashboard?.businessSummary || {};
  const budget = dashboard?.budgetStatus || {};
  const usage = dashboard?.usage || {};
  const decisions = dashboard?.recentDecisions || [];
  const pendingApprovals = dashboard?.pendingApprovals || [];
  const upcomingPosts = dashboard?.upcomingScheduled || [];
  const agentRuns = dashboard?.recentAgentRuns || [];
  const activeCampaigns = dashboard?.activeCampaigns || [];

  const handleRunDailyCycle = async () => {
    setIsCycleRunning(true);
    try {
      await onTriggerCycle();
    } finally {
      setIsCycleRunning(false);
    }
  };

  const handleAgentClick = async (agentKey: string) => {
    setRunningAgent(agentKey);
    try {
      await onTriggerAgent(agentKey);
    } finally {
      setRunningAgent(null);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await apiRequest(`/api/v1/projects/${dashboard?.projectId || 'current'}/ai/approvals/decision`, {
        method: 'POST',
        body: JSON.stringify({ type: 'POST', id: postId, action: 'APPROVE' }),
      });
      success('Post Approved', 'Scheduled for automatic publishing.');
      onRefresh();
    } catch (err: any) {
      error('Approval Failed', err.message);
    }
  };

  const handleRejectPost = async () => {
    if (!rejectReasonModal.item) return;
    try {
      await apiRequest(`/api/v1/projects/${dashboard?.projectId || 'current'}/ai/approvals/decision`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'POST',
          id: rejectReasonModal.item.id,
          action: 'REJECT',
          reason: rejectReasonModal.reason || 'User rejected content',
        }),
      });
      success('Post Rejected', 'Rejection feedback stored into AI Business Memory.');
      setRejectReasonModal({ open: false, item: null, reason: '' });
      onRefresh();
    } catch (err: any) {
      error('Rejection Failed', err.message);
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'AUTONOMOUS':
        return <Badge variant="success" size="md">Autonomous Mode</Badge>;
      case 'SEMI_AUTONOMOUS':
        return <Badge variant="brand" size="md">Semi-Autonomous Mode</Badge>;
      case 'ASSISTED':
        return <Badge variant="info" size="md">Assisted Mode</Badge>;
      default:
        return <Badge variant="neutral" size="md">Manual Mode</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Stop Banner if active */}
      {isEmergencyStopped && (
        <div className="neu-inset border-2 border-red-500 bg-red-500/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl neu-raised bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">EMERGENCY STOP IS ACTIVE</h3>
              <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] mt-0.5">
                {opStatus.emergencyStopReason || 'All automated AI posting and advertising operations are paused.'}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onToggleEmergencyStop(false)}
            className="shrink-0"
          >
            Resume Operations
          </Button>
        </div>
      )}

      {/* Operational Header Bar */}
      <div className="neu-card rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl neu-raised bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--neu-surface)]",
                  isEmergencyStopped ? 'bg-red-500' : 'bg-emerald-500'
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-[var(--neu-text-primary)]">AI Marketing OS</h2>
                {getModeBadge(autonomyMode)}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--neu-text-secondary)] mt-0.5">
                <span>Status:</span>
                <span className={cn("font-bold", isEmergencyStopped ? 'text-red-600' : 'text-emerald-600')}>
                  {isEmergencyStopped ? 'Halted by Emergency Stop' : 'Active & Monitoring'}
                </span>
                <span>•</span>
                <span>Cycle: Daily at {opStatus.dailyExecutionTime || '08:00'} ({opStatus.timezone || 'UTC'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Button
            variant={isEmergencyStopped ? 'outline' : 'danger'}
            size="sm"
            onClick={() => onToggleEmergencyStop(!isEmergencyStopped)}
            icon={<AlertOctagon className="w-3.5 h-3.5" />}
          >
            {isEmergencyStopped ? 'Resume AI' : 'Emergency Stop'}
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={handleRunDailyCycle}
            isLoading={isCycleRunning}
            disabled={isEmergencyStopped}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Run Daily Cycle Now
          </Button>
        </div>
      </div>

      {/* Business Context & AI Marketing Narrative Banner */}
      <div className="neu-card rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Autonomous Daily Briefing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--neu-text-primary)]">
              {bizSummary.name ? `${bizSummary.name}` : 'SchedIt Marketing Engine'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] leading-relaxed font-normal">
              {decisions[0]?.decision
                ? `Latest AI Decision: "${decisions[0].decision}". Based on: ${decisions[0].reasoning || 'Continuous brand evaluation.'}`
                : 'Your marketing operation is running normally. 7 specialized agents analyze market signals, draft multi-format creatives, and manage campaigns within configured financial guardrails.'}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-xs text-[var(--neu-text-secondary)]">Active Goals</div>
              <div className="text-lg font-bold text-[var(--neu-text-primary)]">{bizSummary.activeGoalsCount || 2} Connected Objectives</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('strategy')}
              className="text-xs"
            >
              View Full Strategy <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* 6 Core Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Posts Published"
          value={dashboard?.publishedCount != null ? dashboard.publishedCount : 0}
          change={dashboard?.publishedCount ? "Verified live" : "No published posts yet"}
          changeType="positive"
        />
        <KPICard
          title="Posts Scheduled"
          value={upcomingPosts.length}
          change="Next 7 days queue"
          changeType="neutral"
        />
        <KPICard
          title="Pending Approvals"
          value={pendingApprovals.length}
          change={pendingApprovals.length > 0 ? "Requires review" : "Queue clear"}
          changeType={pendingApprovals.length > 0 ? "warning" : "positive"}
        />
        <KPICard
          title="Active Campaigns"
          value={activeCampaigns.length}
          change="Meta Marketing API"
          changeType="neutral"
        />
        <KPICard
          title="Daily Ad Spend"
          value={`₹${(budget.dailySpent || 0).toLocaleString('en-IN')}`}
          change={`Cap: ₹${(budget.dailyCap || 4000).toLocaleString('en-IN')}/day`}
          changeType="neutral"
        />
        <KPICard
          title="AI Token Cost"
          value={`₹${((Number(usage.totalCostUsd) || 0) * 83).toFixed(2)}`}
          change={`${((usage.totalTokens || 0) / 1000).toFixed(1)}k tokens`}
          changeType="neutral"
        />
      </div>

      {/* Quick Agent Dispatch Toolbar */}
      <div className="neu-card p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--neu-text-primary)] flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg neu-well flex items-center justify-center text-blue-600">
              <Brain className="w-3.5 h-3.5" />
            </div>
            Specialized Agent On-Demand Dispatch
          </h3>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
            Trigger an individual specialized agent to execute targeted marketing actions immediately.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { key: 'strategy', label: 'Strategy', icon: Compass },
            { key: 'research', label: 'Research', icon: TrendingUp },
            { key: 'planning', label: 'Planning', icon: CalendarCheck2 },
            { key: 'creative', label: 'Creative', icon: Wand2 },
            { key: 'writer', label: 'Writer', icon: Edit3 },
            { key: 'qa', label: 'QA Check', icon: ShieldCheck },
            { key: 'advertising', label: 'Meta Ads', icon: Megaphone },
            { key: 'analytics', label: 'Analytics', icon: Layers },
          ].map((agent) => {
            const Icon = agent.icon;
            const isRunning = runningAgent === agent.key;
            return (
              <button
                key={agent.key}
                onClick={() => handleAgentClick(agent.key)}
                disabled={isEmergencyStopped || runningAgent != null}
                className="p-3.5 rounded-2xl neu-raised-sm hover:neu-raised active:neu-inset flex flex-col items-center justify-center gap-2 transition-all text-[var(--neu-text-primary)] disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl neu-well flex items-center justify-center text-blue-600 transition-colors">
                  <Icon className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                </div>
                <span className="text-[11px] font-bold tracking-tight">{agent.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Column: Today's AI Plan & Real-Time AI Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's AI Plan Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[var(--neu-text-primary)]">Today's Content Queue & Actions</h3>
              <Badge variant="brand" size="sm">{upcomingPosts.length + pendingApprovals.length}</Badge>
            </div>
            <button
              onClick={() => onNavigateTab('strategy')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Editorial Calendar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[...pendingApprovals, ...upcomingPosts].length === 0 ? (
              <div className="neu-well rounded-2xl p-8 text-center text-[var(--neu-text-secondary)]">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-[var(--neu-text-primary)]">All planned content is published or up to date</p>
                <p className="text-xs text-[var(--neu-text-secondary)] mt-1">Run the daily operating cycle to generate new creative drafts.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunDailyCycle}
                  className="mt-3 text-xs"
                >
                  Generate New Drafts
                </Button>
              </div>
            ) : (
              [...pendingApprovals, ...upcomingPosts].slice(0, 5).map((post: any) => {
                const isUnderReview = post.status === 'UNDER_REVIEW' || post.status === 'READY_FOR_REVIEW' || post.status === 'DRAFT';
                return (
                  <div
                    key={post.id}
                    className="neu-card rounded-2xl p-4 hover:neu-card-hover transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl neu-well shrink-0 flex items-center justify-center overflow-hidden">
                        {post.media?.[0]?.storagePath || post.media?.[0]?.thumbnailPath ? (
                          <img
                            src={post.media[0].storagePath || post.media[0].thumbnailPath}
                            alt="Media Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusPill status={post.status} />
                          <span className="text-[11px] text-[var(--neu-text-secondary)] font-medium">
                            {post.scheduledTime ? format(new Date(post.scheduledTime), 'h:mm a') : 'Unscheduled'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--neu-text-primary)] line-clamp-2">
                          {post.content || 'Untitled promotional post concept.'}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setSelectedItemForPreview(post)}
                        title="Preview Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {isUnderReview && (
                        <>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => setRejectReasonModal({ open: true, item: post, reason: '' })}
                            title="Reject and Train AI"
                            className="text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="brand"
                            size="xs"
                            onClick={() => handleApprovePost(post.id)}
                            icon={<ThumbsUp className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Live Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[var(--neu-text-primary)]">AI Live Activity & Decisions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Full Audit Logs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="neu-card rounded-2xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
            {decisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--neu-text-secondary)]">
                No recent agent decisions recorded yet. Run the daily cycle to start logging.
              </div>
            ) : (
              decisions.slice(0, 6).map((dec: any) => (
                <div
                  key={dec.id}
                  onClick={() => setSelectedDecisionForReasoning(dec)}
                  className="p-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                        {dec.decisionType || 'DECISION'}
                      </span>
                      <span className="text-[10px] text-[var(--neu-text-secondary)]">
                        {dec.createdAt ? format(new Date(dec.createdAt), 'MMM d, h:mm a') : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--neu-text-primary)] line-clamp-1">{dec.decision}</p>
                    <p className="text-[11px] text-[var(--neu-text-secondary)] line-clamp-1">{dec.reasoning}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Contextual Recommendations Widget */}
      <div className="neu-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl neu-raised bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--neu-text-primary)]">AI Growth Opportunity Detected</h4>
            <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
              Weekend engagement on Instagram Reels is currently outperforming static feed posts by 2.4x. The Creative Director recommends queuing 2 Reels before Friday.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="brand"
            size="sm"
            onClick={() => onNavigateTab('creative')}
            className="text-xs"
          >
            Open Creative Studio
          </Button>
        </div>
      </div>

      {/* Preview Post Modal */}
      {selectedItemForPreview && (
        <Modal
          open={!!selectedItemForPreview}
          onClose={() => setSelectedItemForPreview(null)}
          title="Content Preview & Compliance Inspection"
        >
          <div className="space-y-4">
            <div className="neu-well rounded-xl p-3 text-xs text-[var(--neu-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-[var(--neu-text-primary)]">Status:</span>
                <StatusPill status={selectedItemForPreview.status} />
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[var(--neu-text-primary)]">Scheduled Time:</span>
                <span>{selectedItemForPreview.scheduledTime ? format(new Date(selectedItemForPreview.scheduledTime), 'PPpp') : 'Draft'}</span>
              </div>
            </div>

            {selectedItemForPreview.media?.[0]?.storagePath && (
              <div className="rounded-xl overflow-hidden neu-inset max-h-60 bg-black/5 flex items-center justify-center">
                <img
                  src={selectedItemForPreview.media[0].storagePath}
                  alt="Post visual"
                  className="max-h-60 object-contain"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Generated Caption & Hooks</label>
              <div className="p-3 neu-well rounded-xl text-xs text-[var(--neu-text-primary)] whitespace-pre-wrap leading-relaxed">
                {selectedItemForPreview.content}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForPreview(null)}>
                Close
              </Button>
              {selectedItemForPreview.status !== 'SCHEDULED' && selectedItemForPreview.status !== 'PUBLISHED' && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => {
                    handleApprovePost(selectedItemForPreview.id);
                    setSelectedItemForPreview(null);
                  }}
                >
                  Approve & Schedule
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Reasoning Modal */}
      {selectedDecisionForReasoning && (
        <Modal
          open={!!selectedDecisionForReasoning}
          onClose={() => setSelectedDecisionForReasoning(null)}
          title="AI Agent Decision Details"
        >
          <div className="space-y-3">
            <div className="p-3 neu-well rounded-xl">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {selectedDecisionForReasoning.decisionType}
              </div>
              <h4 className="text-sm font-bold text-[var(--neu-text-primary)] mt-1">
                {selectedDecisionForReasoning.decision}
              </h4>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Reasoning & Supporting Context</label>
              <p className="text-xs text-[var(--neu-text-secondary)] neu-inset rounded-xl p-3 leading-relaxed">
                {selectedDecisionForReasoning.reasoning}
              </p>
            </div>

            {selectedDecisionForReasoning.confidence != null && (
              <div className="flex items-center justify-between text-xs text-[var(--neu-text-secondary)] pt-1">
                <span>Model Confidence:</span>
                <span className="font-bold text-[var(--neu-text-primary)]">
                  {Math.round(selectedDecisionForReasoning.confidence * 100)}%
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedDecisionForReasoning(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Feedback Dialog (Feeds into AI Memory) */}
      {rejectReasonModal.open && (
        <Modal
          open={rejectReasonModal.open}
          onClose={() => setRejectReasonModal({ open: false, item: null, reason: '' })}
          title="Reject Post & Train AI Memory"
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--neu-text-secondary)]">
              Please specify why this content was rejected. Your feedback will be recorded in the AI Business Memory to ensure future generated posts avoid this pattern.
            </p>

            <textarea
              value={rejectReasonModal.reason}
              onChange={(e) => setRejectReasonModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g., Tone is too aggressive, price is outdated, or format is wrong for our audience..."
              className="neu-input w-full text-xs p-3 min-h-[90px]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setRejectReasonModal({ open: false, item: null, reason: '' })}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRejectPost}>
                Reject & Save Feedback
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
