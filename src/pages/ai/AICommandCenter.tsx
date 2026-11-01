import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Wand2,
  Megaphone,
  Brain,
  Shield,
  FileText,
  Sparkles,
  Compass,
  CalendarCheck2,
  Cpu,
  GitBranch,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../lib/utils';
import { CommandCenterOverview } from './CommandCenterOverview';
import { StrategyPlannerView } from './StrategyPlannerView';
import { ContentPlannerView } from './ContentPlannerView';
import { CreativeStudioView } from './CreativeStudioView';
import { AutonomyControlCenter } from './AutonomyControlCenter';
import { VisualWorkflowBuilder } from './VisualWorkflowBuilder';
import { ApprovalCenterView } from './ApprovalCenterView';
import { AdsCommandCenterView } from './AdsCommandCenterView';
import { BusinessMemoryView } from './BusinessMemoryView';
import { AutonomySettingsView } from './AutonomySettingsView';
import { ActivityLogsView } from './ActivityLogsView';

interface AICommandCenterProps {
  initialTab?: string;
}

export function AICommandCenter({ initialTab }: AICommandCenterProps) {
  const { currentProject } = useWorkspace();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve active tab from URL path or query parameter or initialTab prop
  const getTabFromPath = () => {
    const pathname = location.pathname;
    if (pathname.includes('/ai/strategy')) return 'strategy';
    if (pathname.includes('/ai/content-planner')) return 'planner';
    if (pathname.includes('/ai/creative-studio')) return 'creative';
    if (pathname.includes('/ai/automation/workflows')) return 'workflows';
    if (pathname.includes('/ai/automation')) return 'automation';
    if (pathname.includes('/ai/approvals')) return 'approvals';
    if (pathname.includes('/ai/activity')) return 'activity';
    if (pathname.includes('/ai/business-memory')) return 'memory';
    if (pathname.includes('/ads')) return 'ads';
    if (pathname.includes('/settings/ai')) return 'settings';
    return searchParams.get('tab') || initialTab || 'overview';
  };

  const activeTab = getTabFromPath();

  const setActiveTab = (tab: string) => {
    const tabRouteMap: Record<string, string> = {
      overview: '/app/ai',
      strategy: '/app/ai/strategy',
      planner: '/app/ai/content-planner',
      creative: '/app/ai/creative-studio',
      automation: '/app/ai/automation',
      workflows: '/app/ai/automation/workflows',
      approvals: '/app/ai/approvals',
      activity: '/app/ai/activity',
      memory: '/app/ai/business-memory',
      ads: '/app/ads',
      settings: '/app/ai?tab=settings',
    };

    if (tabRouteMap[tab]) {
      navigate(tabRouteMap[tab]);
    } else {
      setSearchParams({ tab });
    }
  };

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/dashboard`);
      setDashboard(data);
    } catch (err: any) {
      console.warn('Dashboard fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleTriggerCycle = async () => {
    if (!currentProject?.id) return;
    try {
      const res = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/cycle`, {
        method: 'POST',
      });
      success('Autonomous Cycle Executed', res.summary || '7-stage marketing operating cycle completed.');
      await fetchDashboard();
    } catch (err: any) {
      error('Daily Cycle Failed', err.message);
    }
  };

  const handleTriggerAgent = async (agentType: string, prompt?: string) => {
    if (!currentProject?.id) return;
    try {
      const res = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/agents/${agentType}`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      success(`${agentType.toUpperCase()} Agent Completed`, `Task executed in ${res.durationMs || 1200}ms.`);
      await fetchDashboard();
    } catch (err: any) {
      error(`Agent ${agentType} Failed`, err.message);
    }
  };

  const handleToggleEmergencyStop = async (enable: boolean) => {
    if (!currentProject?.id) return;
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/ai/emergency-stop`, {
        method: 'POST',
        body: JSON.stringify({ enable, reason: enable ? 'Paused via Command Center' : null }),
      });
      success(
        enable ? 'Emergency Stop Engaged' : 'Operations Resumed',
        enable ? 'All AI external publishing halted.' : 'AI autonomous operating cycle resumed.',
      );
      await fetchDashboard();
    } catch (err: any) {
      error('Failed to change Emergency Stop', err.message);
    }
  };

  if (!currentProject) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Please select or create a project to access the AI Marketing Operating System.
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'strategy', label: 'Strategy', icon: Compass },
    { id: 'planner', label: 'Content Planner', icon: CalendarCheck2 },
    { id: 'creative', label: 'Creative Studio', icon: Wand2 },
    { id: 'automation', label: 'Automation Control', icon: Cpu },
    { id: 'workflows', label: 'Workflow Builder', icon: GitBranch },
    { id: 'approvals', label: 'Approval Center', icon: ShieldCheck },
    { id: 'ads', label: 'Ads Center', icon: Megaphone },
    { id: 'memory', label: 'Business Memory', icon: Brain },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'Guardrails', icon: Shield },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100dvh-3.5rem)] flex flex-col w-full space-y-6">
      {/* Top Page Title */}
      <PageHeader
        title="Autonomous AI Marketing OS"
        description="Continuously researches, plans, creates, validates, schedules, advertises, and measures marketing for your brand."
      />

      {/* Primary Tab Navigation */}
      <div className="neu-well p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer select-none",
                isActive
                  ? 'neu-button-primary text-white shadow-xs'
                  : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Screen */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <CommandCenterOverview
            dashboard={dashboard}
            isLoading={isLoading}
            onRefresh={fetchDashboard}
            onTriggerCycle={handleTriggerCycle}
            onTriggerAgent={handleTriggerAgent}
            onToggleEmergencyStop={handleToggleEmergencyStop}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyPlannerView
            projectId={currentProject.id}
            onRefreshDashboard={fetchDashboard}
          />
        )}

        {activeTab === 'planner' && (
          <ContentPlannerView />
        )}

        {activeTab === 'creative' && (
          <CreativeStudioView
            projectId={currentProject.id}
            onRefreshDashboard={fetchDashboard}
          />
        )}

        {activeTab === 'automation' && (
          <AutonomyControlCenter />
        )}

        {activeTab === 'workflows' && (
          <VisualWorkflowBuilder />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenterView />
        )}

        {activeTab === 'ads' && (
          <AdsCommandCenterView
            projectId={currentProject.id}
            onRefreshDashboard={fetchDashboard}
          />
        )}

        {activeTab === 'memory' && (
          <BusinessMemoryView
            projectId={currentProject.id}
            onRefreshDashboard={fetchDashboard}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLogsView
            projectId={currentProject.id}
          />
        )}

        {activeTab === 'settings' && (
          <AutonomySettingsView
            projectId={currentProject.id}
            onRefreshDashboard={fetchDashboard}
          />
        )}
      </div>
    </div>
  );
}
