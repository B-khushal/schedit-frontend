import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Clock,
  Eye,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckSquare,
  Square,
  Megaphone,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, StatusPill, Modal } from '../../components/ui';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export function ApprovalCenterView() {
  const { currentProject } = useWorkspace();
  const { success, error } = useToast();

  const [approvalsData, setApprovalsData] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'POST' | 'CAMPAIGN' | 'PLAN'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; item: any | null; reason: string }>({
    open: false,
    item: null,
    reason: '',
  });
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  const fetchApprovals = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/approvals`);
      setApprovalsData(data);
      setSelectedIds([]);
    } catch (err: any) {
      console.warn('Approvals fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleDecision = async (
    type: 'POST' | 'CAMPAIGN' | 'PLAN',
    id: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    reason?: string,
    modifiedCaption?: string,
  ) => {
    if (!currentProject?.id) return;
    try {
      const res = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/approvals/decision`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          id,
          action,
          reason,
          modifiedCaption,
        }),
      });
      success(
        action === 'APPROVE' ? 'Item Approved' : 'Item Rejected',
        res.message || 'Action executed successfully.',
      );
      fetchApprovals();
      setRejectDialog({ open: false, item: null, reason: '' });
      setEditItem(null);
    } catch (err: any) {
      error('Decision Failed', err.message);
    }
  };

  const handleBulkApprove = async () => {
    if (!currentProject?.id || selectedIds.length === 0) return;
    try {
      const res = await apiRequest(`/api/v1/projects/${currentProject.id}/ai/approvals/bulk-approve`, {
        method: 'POST',
        body: JSON.stringify({ itemIds: selectedIds }),
      });
      success('Bulk Approval Complete', `${res.approvedCount || selectedIds.length} items approved.`);
      fetchApprovals();
    } catch (err: any) {
      error('Bulk Approval Failed', err.message);
    }
  };

  const items = approvalsData?.items || [];
  const filteredItems = items.filter((item: any) =>
    activeFilter === 'ALL' ? true : item.type === activeFilter,
  );

  const eligibleForBulk = filteredItems.filter(
    (item: any) => item.type === 'POST' && item.riskLevel === 'LOW',
  );

  const selectAllEligible = () => {
    if (selectedIds.length === eligibleForBulk.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleForBulk.map((i: any) => i.id));
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            Human Approval & Oversight Center
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Review, validate, adjust, or reject AI-generated organic posts, advertising campaigns, and strategic calendar changes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchApprovals}
            isLoading={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {selectedIds.length > 0 && (
            <Button
              variant="brand"
              size="sm"
              onClick={handleBulkApprove}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              Bulk Approve ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Bulk Selection Bar */}
      <div className="neu-well p-1.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {[
            { id: 'ALL', label: 'All Items', count: items.length },
            { id: 'POST', label: 'Organic Content', count: approvalsData?.organicCount || 0 },
            { id: 'CAMPAIGN', label: 'Ad Campaigns', count: approvalsData?.adsCount || 0 },
            { id: 'PLAN', label: 'Strategy Plans', count: approvalsData?.plansCount || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer",
                activeFilter === tab.id
                  ? 'neu-button-primary text-white'
                  : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'neu-inset text-[var(--neu-text-secondary)]'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {eligibleForBulk.length > 0 && (
          <div className="flex items-center gap-2 text-xs px-3">
            <button
              onClick={selectAllEligible}
              className="flex items-center gap-1.5 text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] font-semibold cursor-pointer"
            >
              {selectedIds.length === eligibleForBulk.length && selectedIds.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>Select All Low-Risk ({eligibleForBulk.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Approval Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="neu-card p-12 text-center text-[var(--neu-text-secondary)] rounded-2xl">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <h4 className="text-base font-bold text-[var(--neu-text-primary)]">All Approval Queues Clear</h4>
            <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
              There are no pending items requiring human authorization.
            </p>
          </div>
        ) : (
          filteredItems.map((item: any) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="neu-card rounded-2xl p-5 hover:neu-card-hover transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.type === 'POST' && item.riskLevel === 'LOW' && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, item.id]);
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== item.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                      {item.type}
                    </span>
                    <Badge
                      variant={
                        item.riskLevel === 'LOW'
                          ? 'success'
                          : item.riskLevel === 'HIGH'
                          ? 'error'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {item.riskLevel || 'LOW'} RISK
                    </Badge>
                    <span className="text-xs text-[var(--neu-text-secondary)]">
                      Created {item.createdAt ? format(new Date(item.createdAt), 'MMM d, h:mm a') : 'Recently'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRejectDialog({ open: true, item, reason: '' })}
                      icon={<ThumbsDown className="w-3.5 h-3.5 text-red-600" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDecision(item.type, item.id, 'APPROVE')}
                      icon={<ThumbsUp className="w-3.5 h-3.5" />}
                    >
                      Approve
                    </Button>
                  </div>
                </div>

                <div className="p-4 neu-well rounded-xl text-xs text-[var(--neu-text-primary)] leading-relaxed">
                  {item.title || item.content || item.summary || 'Item under review'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Modal */}
      {previewItem && (
        <Modal
          open={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title="Inspect Item for Approval"
        >
          <div className="space-y-4">
            <div className="neu-well p-3 rounded-xl text-xs text-[var(--neu-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Type:</span>
                <span>{previewItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[var(--neu-text-primary)]">Risk Level:</span>
                <span>{previewItem.riskLevel || 'LOW'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--neu-text-primary)] block mb-1">Content Preview</label>
              <div className="p-3 neu-well rounded-xl text-xs text-[var(--neu-text-primary)] whitespace-pre-wrap leading-relaxed">
                {previewItem.content || previewItem.title || JSON.stringify(previewItem, null, 2)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDecision(previewItem.type, previewItem.id, 'APPROVE');
                  setPreviewItem(null);
                }}
              >
                Approve & Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {rejectDialog.open && (
        <Modal
          open={rejectDialog.open}
          onClose={() => setRejectDialog({ open: false, item: null, reason: '' })}
          title="Reject Item & Record Feedback"
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--neu-text-secondary)]">
              Specify reason for rejection. This trains the AI Business Memory to prevent similar drafts in future cycles.
            </p>

            <textarea
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g., Tone is inconsistent with our brand voice, incorrect pricing cited..."
              className="neu-input w-full p-3 text-xs min-h-[90px]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setRejectDialog({ open: false, item: null, reason: '' })}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDecision(rejectDialog.item?.type, rejectDialog.item?.id, 'REJECT', rejectDialog.reason)}
              >
                Reject & Train AI
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
