import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  TrendingUp,
  AlertTriangle,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  DollarSign,
  BarChart3,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, KPICard, Modal } from '../../components/ui';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface AdsCommandCenterViewProps {
  projectId: string;
  onRefreshDashboard: () => void;
}

export function AdsCommandCenterView({ projectId, onRefreshDashboard }: AdsCommandCenterViewProps) {
  const { success, error } = useToast();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [guardrail, setGuardrail] = useState<any | null>(null);
  const [optimizationLogs, setOptimizationLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Draft Modal State
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftObjective, setDraftObjective] = useState('OUTCOME_LEADS');
  const [draftBudget, setDraftBudget] = useState(1000);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const fetchAdsData = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{
        campaigns: any[];
        guardrail: any;
        optimizationLogs: any[];
      }>(`/api/v1/projects/${projectId}/ai/ads`);
      setCampaigns(data.campaigns || []);
      setGuardrail(data.guardrail);
      setOptimizationLogs(data.optimizationLogs || []);
    } catch (err: any) {
      error('Failed to load advertising data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchAdsData();
    }
  }, [projectId]);

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/ads/campaigns/${campaignId}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Paused manually via Ads Command Center' }),
      });
      success('Campaign Paused', 'Ad spending halted immediately.');
      await fetchAdsData();
      onRefreshDashboard();
    } catch (err: any) {
      error('Failed to pause campaign', err.message);
    }
  };

  const handleCreateDraft = async () => {
    if (!draftName.trim()) return;
    setIsCreatingDraft(true);
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/ads/campaigns`, {
        method: 'POST',
        body: JSON.stringify({
          name: draftName,
          objective: draftObjective,
          dailyBudget: draftBudget,
        }),
      });
      success('Campaign Draft Created', 'Draft saved with strict financial guardrails.');
      setShowDraftModal(false);
      setDraftName('');
      setDraftBudget(25);
      await fetchAdsData();
      onRefreshDashboard();
    } catch (err: any) {
      error('Draft Creation Failed', err.message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const totalSpend = campaigns.reduce((acc, c) => acc + (c.currentSpend || 0), 0);
  const totalDailyBudget = campaigns.reduce((acc, c) => acc + (c.status === 'ACTIVE' ? (c.dailyBudget || 0) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--neu-text-primary)] font-display flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <Megaphone className="w-4 h-4" />
            </div>
            Meta Advertising Command Center
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Autonomous ad monitoring, budget guardrails, ROAS optimization, and conversion tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchAdsData}
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowDraftModal(true)}
          >
            Create Campaign Draft
          </Button>
        </div>
      </div>

      {/* Financial Guardrails KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Current Month Spend"
          value={`₹${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`Cap: ₹${(guardrail?.monthlySpendingCap || 40000).toLocaleString('en-IN')}`}
          changeType={totalSpend < (guardrail?.monthlySpendingCap || 40000) * 0.8 ? 'positive' : 'warning'}
        />
        <KPICard
          title="Active Daily Budget"
          value={`₹${totalDailyBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`Daily Cap: ₹${(guardrail?.dailySpendingCap || 4000).toLocaleString('en-IN')}`}
          changeType={totalDailyBudget <= (guardrail?.dailySpendingCap || 4000) ? 'positive' : 'warning'}
        />
        <KPICard
          title="Target Min ROAS"
          value={`${guardrail?.minRoasTarget || 1.5}x`}
          change="Automated Pause Floor"
          changeType="positive"
        />
        <KPICard
          title="Active Campaigns"
          value={campaigns.filter((c) => c.status === 'ACTIVE').length}
          change={`${campaigns.filter((c) => c.status === 'DRAFT').length} Drafts`}
          changeType="neutral"
        />
      </div>

      {/* Campaign List */}
      <div className="neu-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--neu-text-primary)]">Meta Ad Campaigns</h3>
            <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">Monitored campaigns with live efficiency indicators</p>
          </div>
          <Badge variant="brand" size="md">
            {campaigns.length} Campaigns
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-sm text-[var(--neu-text-secondary)]">
              No ad campaigns found. Create your first campaign draft or run the advertising agent to prepare recommendations.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="neu-well text-[var(--neu-text-secondary)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Objective</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Daily Budget</th>
                  <th className="py-3 px-4">Spend</th>
                  <th className="py-3 px-4">ROAS / CPA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {campaigns.map((camp) => {
                  const m = camp.metrics || {};
                  return (
                    <tr key={camp.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[var(--neu-text-primary)]">
                        {camp.name}
                        {camp.aiOptimizationReason && (
                          <p className="text-[10px] text-blue-600 font-normal mt-0.5 line-clamp-1">
                            AI Note: {camp.aiOptimizationReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--neu-text-secondary)]">
                        {camp.objective.replace('OUTCOME_', '')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={camp.status === 'ACTIVE' ? 'success' : camp.status === 'PAUSED' ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--neu-text-primary)]">
                        ₹{(camp.dailyBudget || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
                      </td>
                      <td className="py-3.5 px-4 text-[var(--neu-text-secondary)]">
                        ₹{(camp.currentSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-600">{m.roas ? `${m.roas}x` : 'N/A'}</span>
                        {m.cpa ? <span className="text-[var(--neu-text-secondary)] ml-1">(₹{m.cpa})</span> : null}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {camp.status === 'ACTIVE' && (
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
                            onClick={() => handlePauseCampaign(camp.id)}
                          >
                            Pause
                          </Button>
                        )}
                        {camp.status === 'DRAFT' && (
                          <Badge variant="brand" size="sm">
                            Draft (Ready for Launch)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Draft Modal */}
      {showDraftModal && (
        <Modal
          open={showDraftModal}
          onClose={() => setShowDraftModal(false)}
          title="Create New Meta Ad Campaign Draft"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. Q4 Flagship Conversion Sequence"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="neu-input w-full px-3.5 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Campaign Objective</label>
                <select
                  value={draftObjective}
                  onChange={(e) => setDraftObjective(e.target.value)}
                  className="neu-input w-full px-3.5 py-2 text-xs"
                >
                  <option value="OUTCOME_LEADS">Lead Generation</option>
                  <option value="OUTCOME_SALES">Conversions & Purchases</option>
                  <option value="OUTCOME_TRAFFIC">Link Clicks & Traffic</option>
                  <option value="OUTCOME_ENGAGEMENT">Post Engagement & Video Views</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Daily Budget (₹ INR)</label>
                <input
                  type="number"
                  min={100}
                  max={guardrail?.dailySpendingCap || 4000}
                  value={draftBudget}
                  onChange={(e) => setDraftBudget(Number(e.target.value))}
                  className="neu-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="neu-well p-3 rounded-xl text-xs text-[var(--neu-text-secondary)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hard financial cap is ₹{(guardrail?.dailySpendingCap || 4000).toLocaleString('en-IN')}/day. AI cannot exceed this limit.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDraftModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isCreatingDraft}
                onClick={handleCreateDraft}
                disabled={!draftName.trim()}
              >
                Create Campaign Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
