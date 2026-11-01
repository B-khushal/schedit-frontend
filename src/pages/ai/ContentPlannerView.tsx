import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck2,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Wand2,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Badge, StatusPill, Modal } from '../../components/ui';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';

export function ContentPlannerView() {
  const { currentProject } = useWorkspace();
  const { success, error } = useToast();

  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planThemePrompt, setPlanThemePrompt] = useState('');
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/plans`);
      setPlans(data || []);
      if (data && data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      console.warn('Error fetching content plans:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, selectedPlan]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleGeneratePlan = async () => {
    if (!currentProject?.id) return;
    setIsGeneratingPlan(true);
    try {
      const res = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/plans`, {
        method: 'POST',
        body: JSON.stringify({ theme: planThemePrompt || undefined }),
      });
      success('AI Content Plan Generated', 'New weekly editorial schedule formulated by Strategy & Planning agents.');
      setCreatePlanModalOpen(false);
      setPlanThemePrompt('');
      await fetchPlans();
    } catch (err: any) {
      error('Plan Generation Failed', err.message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const currentItems = selectedPlan?.items || [];
  const filteredItems = currentItems.filter((item: any) => {
    const matchPlatform = platformFilter === 'ALL' || item.platform === platformFilter;
    const matchFormat = formatFilter === 'ALL' || item.contentType === formatFilter;
    return matchPlatform && matchFormat;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            AI Content Planner & Editorial Calendar
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Weekly and monthly content schedules formulated to balance brand storytelling, customer acquisition, and engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPlans}
            isLoading={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={() => setCreatePlanModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate New Content Plan
          </Button>
        </div>
      </div>

      {/* Plan Version Selector & Filters Bar */}
      <div className="neu-well p-2 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 px-2">
          <span className="text-xs font-bold text-[var(--neu-text-secondary)]">Active Plan:</span>
          {plans.length === 0 ? (
            <span className="text-xs text-[var(--neu-text-secondary)]">No content plans generated yet</span>
          ) : (
            plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedPlan?.id === p.id
                    ? 'neu-button-primary text-white'
                    : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
                )}
              >
                {p.title}
              </button>
            ))
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="neu-input px-3 py-1.5 text-xs font-bold"
          >
            <option value="ALL">All Platforms</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="neu-input px-3 py-1.5 text-xs font-bold"
          >
            <option value="ALL">All Formats</option>
            <option value="FEED">Feed Post</option>
            <option value="REEL">Reel / Short</option>
            <option value="CAROUSEL">Carousel</option>
            <option value="STORY">Story</option>
          </select>
        </div>
      </div>

      {/* Content Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="neu-card rounded-2xl p-12 text-center text-[var(--neu-text-secondary)]">
          <CalendarIcon className="w-10 h-10 mx-auto text-blue-600 mb-2 opacity-80" />
          <h4 className="text-base font-bold text-[var(--neu-text-primary)]">No Content Items in Current Plan</h4>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1 max-w-sm mx-auto">
            Generate an AI content plan to formulate platform-tailored post concepts with scheduled publishing windows.
          </p>
          <Button
            variant="brand"
            size="sm"
            onClick={() => setCreatePlanModalOpen(true)}
            className="mt-4 text-xs"
          >
            Generate Content Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="neu-card rounded-2xl p-5 hover:neu-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                    {item.platform}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {item.contentType || 'FEED'}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--neu-text-primary)] line-clamp-2">
                    {item.topic || item.concept || 'Weekly Scheduled Storytelling'}
                  </h4>
                  <p className="text-xs text-[var(--neu-text-secondary)] line-clamp-3 mt-1.5 leading-relaxed">
                    {item.caption || item.hook || 'Content angle designed to reinforce audience connection and business value.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[var(--neu-text-secondary)] font-mono">
                  {item.scheduledTime ? format(new Date(item.scheduledTime), 'EEE, MMM d • h:mm a') : 'Day ' + (idx + 1)}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedItemForDetail(item)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Generation Modal */}
      {createPlanModalOpen && (
        <Modal
          open={createPlanModalOpen}
          onClose={() => setCreatePlanModalOpen(false)}
          title="Generate Autonomous Content Plan"
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--neu-text-secondary)]">
              Specialized Strategy and Planning agents will formulate an editorial calendar based on your verified business facts, target audience, and active offers.
            </p>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Optional Campaign Focus / Theme</label>
              <textarea
                value={planThemePrompt}
                onChange={(e) => setPlanThemePrompt(e.target.value)}
                placeholder="e.g. Black Friday Launch, Education on AI Agents, Community Growth Sprint..."
                className="neu-input w-full p-3 text-xs min-h-[90px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setCreatePlanModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isGeneratingPlan}
                onClick={handleGeneratePlan}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate Plan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Item Detail Modal */}
      {selectedItemForDetail && (
        <Modal
          open={!!selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          title="Planned Content Concept Details"
        >
          <div className="space-y-4">
            <div className="neu-well p-3 rounded-xl text-xs text-[var(--neu-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Platform:</span>
                <span>{selectedItemForDetail.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Format:</span>
                <span>{selectedItemForDetail.contentType || 'FEED'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Concept Topic</label>
              <div className="p-3 neu-well rounded-xl text-xs font-semibold text-[var(--neu-text-primary)]">
                {selectedItemForDetail.topic || selectedItemForDetail.concept}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Draft Caption / Hook</label>
              <div className="p-3 neu-well rounded-xl text-xs text-[var(--neu-text-primary)] whitespace-pre-wrap leading-relaxed">
                {selectedItemForDetail.caption || selectedItemForDetail.hook}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
