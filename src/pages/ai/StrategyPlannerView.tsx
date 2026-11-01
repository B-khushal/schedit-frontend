import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Plus,
  CheckCircle,
  Clock,
  Send,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Target,
  BarChart2,
  PieChart,
  Calendar,
  Check,
  X,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, StatusPill, Modal } from '../../components/ui';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface StrategyPlannerViewProps {
  projectId: string;
  onRefreshDashboard?: () => void;
}

export function StrategyPlannerView({ projectId, onRefreshDashboard }: StrategyPlannerViewProps) {
  const { success, error } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planTheme, setPlanTheme] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const fetchPlansAndGoals = async () => {
    setIsLoading(true);
    try {
      const [plansData, memoryData] = await Promise.all([
        apiRequest<any[]>(`/api/v1/projects/${projectId}/ai/plans`),
        apiRequest<any>(`/api/v1/projects/${projectId}/ai/memory`),
      ]);
      setPlans(plansData || []);
      setGoals(memoryData?.goals || []);
      if (plansData?.length > 0 && !selectedPlan) {
        setSelectedPlan(plansData[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load strategy plans:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPlansAndGoals();
    }
  }, [projectId]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/plans`, {
        method: 'POST',
        body: JSON.stringify({ theme: planTheme }),
      });
      success('Strategy Plan Generated', 'AI has formulated a new multi-platform marketing strategy.');
      setShowGenerateModal(false);
      setPlanTheme('');
      await fetchPlansAndGoals();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err: any) {
      error('Plan Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const contentMix = [
    { label: 'Educational & Value', percent: 40, color: 'bg-blue-600' },
    { label: 'Product & Offers', percent: 30, color: 'bg-emerald-500' },
    { label: 'Audience Engagement', percent: 20, color: 'bg-purple-500' },
    { label: 'Cultural & Trending', percent: 10, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Top Banner */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <Compass className="w-4 h-4" />
            </div>
            AI Marketing Strategy & Growth Targets
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Data-backed strategy themes, content mix ratios, and platform allocations connected to measurable milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Weekly / Monthly toggle */}
          <div className="neu-well p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveView('weekly')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                activeView === 'weekly' ? 'neu-button-primary text-white' : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
              )}
            >
              Weekly View
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                activeView === 'monthly' ? 'neu-button-primary text-white' : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
              )}
            >
              Monthly View
            </button>
          </div>

          <Button
            variant="brand"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Formulate Strategy
          </Button>
        </div>
      </div>

      {/* 2-Column: Content Mix & Strategic Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content Mix Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="neu-card p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--neu-text-primary)] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                Strategic Content Mix Ratio
              </h3>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Target distribution maintained by Content Planning Agent
              </p>
            </div>

            {/* Visual ratio bar */}
            <div className="h-4 rounded-full overflow-hidden flex shadow-inner">
              {contentMix.map((item, idx) => (
                <div
                  key={idx}
                  style={{ width: `${item.percent}%` }}
                  className={`${item.color} h-full transition-all`}
                  title={`${item.label}: ${item.percent}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2.5 pt-2">
              {contentMix.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-semibold text-[var(--neu-text-primary)]">{item.label}</span>
                  </div>
                  <span className="font-bold text-[var(--neu-text-secondary)] font-mono">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Business Objectives & KPIs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neu-card p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--neu-text-primary)] flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Active Marketing Objectives & Milestones
              </h3>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                Autonomous agents optimize daily content and ad spend to meet these targets
              </p>
            </div>

            {goals.length === 0 ? (
              <div className="neu-well p-6 rounded-xl text-center text-xs text-[var(--neu-text-secondary)]">
                No active strategic goals recorded yet. Add goals in Business Memory to guide AI optimization.
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {goals.map((g) => (
                  <div key={g.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                          {g.category || 'GROWTH'}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--neu-text-primary)]">{g.title}</h4>
                      </div>
                      <p className="text-[11px] text-[var(--neu-text-secondary)]">{g.description || 'Continuous milestone target'}</p>
                    </div>
                    <Badge variant={g.status === 'COMPLETED' ? 'success' : 'brand'} size="sm">
                      {g.targetMetric || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategy Generate Modal */}
      {showGenerateModal && (
        <Modal
          open={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title="Formulate AI Marketing Strategy"
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--neu-text-secondary)]">
              The Marketing Strategy Agent will analyze current market signals, competitors, and historical learnings to draft a unified strategy plan.
            </p>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Optional Strategic Direction / Theme</label>
              <textarea
                value={planTheme}
                onChange={(e) => setPlanTheme(e.target.value)}
                placeholder="e.g. Focus heavily on short-form video demonstration of ROI, targeting SaaS founders..."
                className="neu-input w-full p-3 text-xs min-h-[90px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isGenerating}
                onClick={handleGeneratePlan}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate Strategy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
