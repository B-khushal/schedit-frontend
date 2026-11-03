import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '../../components/ui';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface ActivityLogsViewProps {
  projectId: string;
}

export function ActivityLogsView({ projectId }: ActivityLogsViewProps) {
  const { error } = useToast();
  const [logsData, setLogsData] = useState<{
    agentRuns: any[];
    decisions: any[];
    executionLogs: any[];
  }>({ agentRuns: [], decisions: [], executionLogs: [] });

  const [usage, setUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'runs' | 'tools' | 'decisions'>('runs');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [logs, usageSummary] = await Promise.all([
        apiRequest(`/api/v1/projects/${projectId}/ai/logs?limit=50`),
        apiRequest(`/api/v1/projects/${projectId}/ai/usage?days=30`),
      ]);
      setLogsData(logs);
      setUsage(usageSummary);
    } catch (err: any) {
      error('Failed to load activity logs', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLogs();
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--neu-text-primary)] font-display flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            AI Activity Logs & Audit Trail
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Auditable, transparent record of all agent executions, backend tools called, and token usage.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={fetchLogs}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Usage Analytics Strip */}
      {usage && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="neu-card p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">30-Day AI Expenditure</p>
            <p className="text-xl font-bold text-[var(--neu-text-primary)] mt-1.5">₹{((Number(usage.totalCostUsd) || 0) * 83).toFixed(2)}</p>
          </div>
          <div className="neu-card p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">Total Input Tokens</p>
            <p className="text-xl font-bold text-[var(--neu-text-primary)] mt-1.5">{(usage.totalInputTokens || 0).toLocaleString()}</p>
          </div>
          <div className="neu-card p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">Total Output Tokens</p>
            <p className="text-xl font-bold text-[var(--neu-text-primary)] mt-1.5">{(usage.totalOutputTokens || 0).toLocaleString()}</p>
          </div>
          <div className="neu-card p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">Operations Tracked</p>
            <p className="text-xl font-bold text-[var(--neu-text-primary)] mt-1.5">{usage.recordsCount || 0}</p>
          </div>
        </div>
      )}

      {/* Log Tabs */}
      <div className="neu-well p-1.5 rounded-2xl inline-flex gap-1.5">
        <button
          onClick={() => setActiveTab('runs')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === 'runs'
              ? 'neu-button-primary text-white'
              : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
          )}
        >
          Agent Runs ({logsData.agentRuns.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === 'tools'
              ? 'neu-button-primary text-white'
              : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
          )}
        >
          Tools Invoked ({logsData.executionLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === 'decisions'
              ? 'neu-button-primary text-white'
              : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
          )}
        >
          AI Decisions ({logsData.decisions.length})
        </button>
      </div>

      {/* Logs Table */}
      <div className="neu-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'runs' && (
            <table className="w-full text-left text-xs">
              <thead className="neu-well text-[var(--neu-text-secondary)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tokens / Cost</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {logsData.agentRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[var(--neu-text-secondary)]">
                      No agent executions recorded yet.
                    </td>
                  </tr>
                ) : (
                  logsData.agentRuns.map((r) => (
                    <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[var(--neu-text-secondary)]">
                        {new Date(r.startedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--neu-text-primary)]">{r.agentName}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--neu-text-secondary)]">{r.taskType}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono neu-inset px-2 py-0.5 rounded-md text-[var(--neu-text-secondary)]">
                          {r.triggerSource}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={r.status === 'COMPLETED' ? 'success' : 'error'} size="sm">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[var(--neu-text-primary)] font-mono">
                        {r.totalInputTokens + r.totalOutputTokens}t • ₹{((Number(r.estimatedCostUsd) || 0) * 83).toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--neu-text-secondary)]">
                        {r.executionDurationMs ? `${(r.executionDurationMs / 1000).toFixed(1)}s` : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'tools' && (
            <table className="w-full text-left text-xs">
              <thead className="neu-well text-[var(--neu-text-secondary)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">Invoked By Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Arguments</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {logsData.executionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--neu-text-secondary)]">
                      No tool invocations recorded yet.
                    </td>
                  </tr>
                ) : (
                  logsData.executionLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[var(--neu-text-secondary)]">
                        {new Date(l.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 font-mono">{l.toolName}</td>
                      <td className="py-3 px-4 text-[var(--neu-text-secondary)]">{l.agentRun?.agentName || 'Pipeline'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={l.status === 'SUCCESS' ? 'success' : 'error'} size="sm">
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--neu-text-secondary)] max-w-xs truncate">
                        {JSON.stringify(l.inputPayload || {})}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--neu-text-secondary)]">
                        {l.durationMs ? `${l.durationMs}ms` : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'decisions' && (
            <table className="w-full text-left text-xs">
              <thead className="neu-well text-[var(--neu-text-secondary)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Reasoning</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {logsData.decisions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--neu-text-secondary)]">
                      No strategic decisions recorded yet.
                    </td>
                  </tr>
                ) : (
                  logsData.decisions.map((d) => (
                    <tr key={d.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[var(--neu-text-secondary)] whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                          {d.decisionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--neu-text-primary)]">{d.decision}</td>
                      <td className="py-3 px-4 text-[var(--neu-text-secondary)] max-w-md line-clamp-2">{d.reasoning}</td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--neu-text-primary)]">
                        {d.confidence != null ? `${Math.round(d.confidence * 100)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
