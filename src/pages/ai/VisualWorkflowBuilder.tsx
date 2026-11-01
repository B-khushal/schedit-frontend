import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Brain,
  Wand2,
  PenSquare,
  Megaphone,
  BarChart3,
  RefreshCw,
  Info,
  ChevronRight,
  Check,
  Settings,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, Modal } from '../../components/ui';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface WorkflowNode {
  id: string;
  name: string;
  agent: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED';
  icon: React.ComponentType<{ className?: string }>;
  details: {
    inputs: string[];
    outputs: string[];
    rules: string[];
    requiresHumanReview?: boolean;
  };
}

export function VisualWorkflowBuilder() {
  const { currentProject } = useWorkspace();
  const { success, error } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState('daily_marketing');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);

  const pipelineNodes: WorkflowNode[] = [
    {
      id: 'step-1',
      name: 'Business Context & Identity',
      agent: 'Business Memory Engine',
      description: 'Retrieves brand identity, active products, offers, tone of voice, and historical learnings.',
      status: 'COMPLETED',
      icon: Brain,
      details: {
        inputs: ['PostgreSQL Business Knowledge', 'Brand Guidelines', 'Active Offers Catalog'],
        outputs: ['Formatted Prompt Context', 'Tone Constraints', 'Excluded Competitor Topics'],
        rules: ['Tenant isolation enforced', 'Never mix workspace knowledge'],
      },
    },
    {
      id: 'step-2',
      name: 'Marketing Research & Trends',
      agent: 'Research Agent',
      description: 'Scrapes trending topics, upcoming seasonal occasions/holidays, and public competitor angles.',
      status: 'COMPLETED',
      icon: Sparkles,
      details: {
        inputs: ['Target Region Calendar', 'Industry Keywords', 'Social Trend Feeds'],
        outputs: ['Trend Synthesis', 'Trending Hashtags', 'Occasion Hooks'],
        rules: ['No hallucinated trends', 'Record source attribution timestamps'],
      },
    },
    {
      id: 'step-3',
      name: 'Marketing Strategy Generation',
      agent: 'Marketing Strategy Agent',
      description: 'Formulates weekly marketing themes, format allocation ratios, and measurable KPI targets.',
      status: 'COMPLETED',
      icon: Layers,
      details: {
        inputs: ['Research Output', 'Quarterly Follower & Revenue Goals', 'Past Post Analytics'],
        outputs: ['Weekly Strategy Theme', 'Platform Distribution Plan', 'Target KPIs'],
        rules: ['Must align with business goals', 'Distinguish predictions from facts'],
      },
    },
    {
      id: 'step-4',
      name: 'Content Planning & Editorial Mix',
      agent: 'Content Planning Agent',
      description: 'Plans daily content calendar balancing educational, promotional, entertaining, and engagement content.',
      status: 'COMPLETED',
      icon: Clock,
      details: {
        inputs: ['Strategy Theme', 'Publishing Time Windows', 'Connected Channel Slots'],
        outputs: ['7-Day Planned Items', 'Assigned Format per Channel', 'Draft Concepts'],
        rules: ['Avoid consecutive promotional posts', 'Respect optimal audience engagement times'],
      },
    },
    {
      id: 'step-5',
      name: 'Creative Direction & Storyboards',
      agent: 'Creative Director Agent',
      description: 'Creates detailed creative briefs, 9:16 vertical Reel scripts, and carousel concepts.',
      status: 'COMPLETED',
      icon: Wand2,
      details: {
        inputs: ['Planned Item Topic', 'Brand Visual Guidelines', 'Hex Color Palette'],
        outputs: ['Image Prompts', 'Multi-Slide Carousel Brief', 'Reel Audio & Video Storyboard'],
        rules: ['Enforce brand colors and typography', 'Match channel aspect ratios (1:1, 9:16)'],
      },
    },
    {
      id: 'step-6',
      name: 'Content Writing & Hooks',
      agent: 'Content Writer Agent',
      description: 'Drafts persuasive caption sets, 3 distinct hook variations, and platform-compliant hashtags.',
      status: 'COMPLETED',
      icon: PenSquare,
      details: {
        inputs: ['Creative Brief', 'Brand Voice Guide', 'Verified Offer Pricing'],
        outputs: ['3 Hook Options', 'Primary Caption Body', 'Platform Hashtag Set'],
        rules: ['Never fabricate prices or discounts', 'Respect character limits per platform'],
      },
    },
    {
      id: 'step-7',
      name: 'QA & Compliance Validation',
      agent: 'QA & Compliance Agent',
      description: 'Evaluates drafts against brand policies, prohibited claims, pricing integrity, and safety guardrails.',
      status: 'COMPLETED',
      icon: ShieldCheck,
      details: {
        inputs: ['Draft Caption & Visual', 'Brand Guardrails', 'Regulatory Compliance Checklists'],
        outputs: ['Safety Score (0-1.0)', 'Violation Alerts', 'Approved / Flagged Flag'],
        rules: ['Must reject content if price is unverified', 'Block prohibited claims'],
      },
    },
    {
      id: 'step-8',
      name: 'Approval Policy Check',
      agent: 'Central Orchestrator',
      description: 'Routes draft to Human Approval Center or permits direct scheduling based on active Autonomy Policy.',
      status: 'IN_PROGRESS',
      icon: GitBranch,
      details: {
        inputs: ['QA Validated Asset', 'Active Autonomy Mode (Manual/Assisted/Semi/Auto)'],
        outputs: ['Route to Approval Queue OR Direct Schedule'],
        rules: ['Ad spend always checks guardrails', 'Low-risk organic passes in Autonomous mode'],
        requiresHumanReview: true,
      },
    },
    {
      id: 'step-9',
      name: 'Scheduling & Queue Dispatch',
      agent: 'Publishing Agent',
      description: 'Enqueues validated posts into BullMQ worker queues with exponential retry policies.',
      status: 'PENDING',
      icon: Clock,
      details: {
        inputs: ['Approved Post Record', 'Target Channel Access Tokens', 'Scheduled Timestamp'],
        outputs: ['BullMQ Job ID', 'Platform Scheduled Record'],
        rules: ['Prevent duplicate queue insertions', 'Check account permission scopes before dispatch'],
      },
    },
    {
      id: 'step-10',
      name: 'Channel Publishing',
      agent: 'Headless Publishing Worker',
      description: 'Executes actual publication via Meta Graph API, LinkedIn, and YouTube APIs.',
      status: 'PENDING',
      icon: Play,
      details: {
        inputs: ['BullMQ Trigger', 'Media Assets from Cloudinary', 'Social Account Auth'],
        outputs: ['Live Social Post ID', 'Permalink URL', 'Publication Confirmation'],
        rules: ['Handle rate-limits with backoff', 'Never publish if Emergency Stop is triggered'],
      },
    },
    {
      id: 'step-11',
      name: 'Performance Feedback & Learning Loop',
      agent: 'Analytics Agent',
      description: 'Measures engagement, reach, and conversions. Feeds verified learnings back into Business Memory.',
      status: 'PENDING',
      icon: BarChart3,
      details: {
        inputs: ['Meta Insights API', 'Post Likes/Comments/Saves', 'Ad ROAS & CPA'],
        outputs: ['Updated Engagement Patterns', 'Optimal Time Adjustments', 'New Memory Records'],
        rules: ['Record source timestamps', 'Continuously adapt future creative prompts'],
      },
    },
  ];

  const templates = [
    { id: 'daily_marketing', name: 'Daily Autonomous Marketing (11 Steps)' },
    { id: 'weekly_planning', name: 'Weekly Content Planning Cycle' },
    { id: 'festival_campaign', name: 'Festival & Seasonal Promo Campaign' },
    { id: 'product_launch', name: 'New Product Promotion Sequence' },
    { id: 'ads_monitoring', name: 'Continuous Meta Ads Optimization' },
    { id: 'performance_review', name: 'Weekly Closed-Loop Learning' },
  ];

  const handleSimulateRun = () => {
    setIsSimulatingRun(true);
    setTimeout(() => {
      setIsSimulatingRun(false);
      success('Dry-Run Simulation Complete', 'All 11 autonomous workflow stages validated successfully against workspace memory.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Top Banner */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <GitBranch className="w-4 h-4" />
            </div>
            Visual Automation Workflow Builder
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Understand, configure, and inspect the continuous autonomous marketing sequence from context retrieval to closed-loop learning.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="brand"
            size="sm"
            onClick={handleSimulateRun}
            isLoading={isSimulatingRun}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Execute Pipeline Dry-Run
          </Button>
        </div>
      </div>

      {/* Template Selector Bar */}
      <div className="neu-well p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        <span className="text-[11px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider px-2 shrink-0">Templates:</span>
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setSelectedTemplate(tpl.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer",
              selectedTemplate === tpl.id
                ? 'neu-button-primary text-white'
                : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
            )}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Visual Pipeline Canvas */}
      <div className="neu-well p-6 sm:p-8 rounded-2xl overflow-x-auto">
        <div className="min-w-[700px] flex flex-col items-center space-y-4">
          {pipelineNodes.map((node, index) => {
            const Icon = node.icon;
            const isLast = index === pipelineNodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={cn(
                    "w-full max-w-xl neu-card rounded-2xl p-5 hover:neu-card-hover transition-all cursor-pointer flex items-center justify-between gap-4 select-none",
                    node.status === 'IN_PROGRESS' && 'ring-2 ring-blue-500/50'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl neu-well flex items-center justify-center shrink-0",
                        node.status === 'COMPLETED'
                          ? 'text-emerald-500'
                          : node.status === 'IN_PROGRESS'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase">Step {index + 1}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--neu-text-primary)] truncate">{node.name}</h4>
                        {node.details.requiresHumanReview && (
                          <Badge variant="amber" size="sm">Approval Checkpoint</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--neu-text-secondary)] line-clamp-1">{node.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        node.status === 'COMPLETED'
                          ? 'success'
                          : node.status === 'IN_PROGRESS'
                          ? 'brand'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {node.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Connecting arrow */}
                {!isLast && (
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-black/10 dark:bg-white/10" />
                    <ArrowDown className="w-4 h-4 text-blue-500" />
                    <div className="w-0.5 h-3 bg-black/10 dark:bg-white/10" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Node Inspection Modal */}
      {selectedNode && (
        <Modal
          open={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={`Pipeline Stage: ${selectedNode.name}`}
        >
          <div className="space-y-4">
            <div className="neu-well p-3 rounded-xl text-xs text-[var(--neu-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Executing Agent:</span>
                <span>{selectedNode.agent}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Status:</span>
                <Badge variant={selectedNode.status === 'COMPLETED' ? 'success' : 'brand'} size="sm">
                  {selectedNode.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Inputs Retrieved</label>
              <ul className="neu-well rounded-xl p-3 text-xs space-y-1 text-[var(--neu-text-secondary)] list-disc list-inside">
                {selectedNode.details.inputs.map((inp, i) => (
                  <li key={i}>{inp}</li>
                ))}
              </ul>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Outputs Formulated</label>
              <ul className="neu-well rounded-xl p-3 text-xs space-y-1 text-[var(--neu-text-secondary)] list-disc list-inside">
                {selectedNode.details.outputs.map((out, i) => (
                  <li key={i}>{out}</li>
                ))}
              </ul>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Safety & Execution Rules Enforced</label>
              <ul className="neu-well rounded-xl p-3 text-xs space-y-1 text-[var(--neu-text-secondary)] list-disc list-inside">
                {selectedNode.details.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedNode(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
