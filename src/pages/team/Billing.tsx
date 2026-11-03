import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Zap, CheckCircle2, RefreshCw, Sparkles, ShieldCheck, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Button, PageHeader, Card, StatusPill } from '../../components/ui';

export function Billing() {
  const { currentOrg, refreshWorkspace } = useWorkspace();
  const { plan: contextPlan, refreshPermissions } = useSubscription();
  const { success: toastSuccess, error: toastError } = useToast();

  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchBillingData = async () => {
    if (!currentOrg) return;
    try {
      const [subData, usageData] = await Promise.all([
        apiRequest(`/api/v1/billing/subscription?orgId=${currentOrg.id}`).catch(() => null),
        apiRequest(`/api/v1/billing/usage?orgId=${currentOrg.id}`).catch(() => []),
      ]);
      setSubscription(subData);
      setUsage(usageData || []);
    } catch (err) {
      console.error('Failed to load billing metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg) {
      fetchBillingData();
    }
  }, [currentOrg]);

  const handleUpgrade = async (planId: string) => {
    if (!currentOrg) return;
    setUpgrading(true);
    try {
      await apiRequest('/api/v1/billing/subscribe', {
        method: 'POST',
        body: JSON.stringify({ orgId: currentOrg.id, planId: planId.toLowerCase() }),
      });

      await refreshPermissions();
      await refreshWorkspace();
      await fetchBillingData();

      toastSuccess('Plan Upgraded!', `Successfully upgraded your workspace to ${planId} Plan.`);
    } catch (err: any) {
      toastError('Subscription Error', err.message || 'Could not upgrade your workspace.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-gray-500 font-semibold">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-brand-500" />
        Loading billing settings...
      </div>
    );
  }

  const currentPlan = (contextPlan || subscription?.planId || currentOrg?.subscriptionPlan || 'FREE').toUpperCase();
  const invoices = subscription?.invoices || [];

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto w-full space-y-8 animate-fade-in bg-transparent">
      <PageHeader
        title="Billing & Subscription"
        description="Verify billing plans, stripe tokens, invoice copies, and workspace usage trackers."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[var(--neu-text-primary)]">
        {/* Subscription Plan details */}
        <div className="md:col-span-2 neu-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10 text-left">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-extrabold text-[var(--neu-text-primary)] capitalize font-display">{currentPlan.toLowerCase()} Tier</h2>
                <span className="px-3 py-1 neu-pill-inset text-blue-500 text-xs font-bold uppercase tracking-wider rounded-full">
                  Active
                </span>
              </div>
              <p className="text-[var(--neu-text-secondary)] text-xs sm:text-sm font-semibold">Instant permission updates. Zero logout required.</p>
            </div>
            
            <div className="text-left sm:text-right">
              <div className="text-3xl font-extrabold text-[var(--neu-text-primary)] font-display">
                {currentPlan === 'ENTERPRISE' ? '₹24,999' : currentPlan === 'BUSINESS' ? '₹6,499' : currentPlan === 'PROFESSIONAL' ? '₹2,499' : '₹0'}
                <span className="text-sm text-[var(--neu-text-muted)] font-bold">/mo</span>
              </div>
              <p className="text-xs text-[var(--neu-text-muted)] mt-1 font-medium">Monthly Billing Cycle</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[var(--neu-border-inset)]/50 flex flex-col sm:flex-row sm:flex-wrap gap-3 relative z-10">
            {currentPlan !== 'PROFESSIONAL' && (
              <Button variant="primary" loading={upgrading} onClick={() => handleUpgrade('PROFESSIONAL')}>
                Upgrade to Professional (₹2,499)
              </Button>
            )}
            {currentPlan !== 'BUSINESS' && (
              <Button variant="primary" loading={upgrading} onClick={() => handleUpgrade('BUSINESS')}>
                Upgrade to Business (₹6,499)
              </Button>
            )}
            {currentPlan !== 'ENTERPRISE' && (
              <Button variant="primary" loading={upgrading} onClick={() => handleUpgrade('ENTERPRISE')}>
                Upgrade to Enterprise (₹24,999)
              </Button>
            )}
          </div>
        </div>

        {/* Payment Card overview */}
        <div className="neu-card rounded-3xl p-6 flex flex-col justify-between text-left">
          <div>
            <h3 className="text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider mb-4">Payment Method</h3>
            <div className="flex items-center gap-3 neu-well p-4 rounded-2xl">
              <CreditCard className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[var(--neu-text-primary)]">•••• •••• •••• 4242</p>
                <p className="text-[11px] text-[var(--neu-text-muted)] font-bold">Expires 12/28</p>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="mt-6 w-full">
            Update Method
          </Button>
        </div>
      </div>

      {/* Usage Limit Bars */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-card text-left">
        <h3 className="text-base font-bold text-gray-900 mb-6 font-display">Workspace Limit Trackers</h3>
        
        <div className="space-y-6">
          {usage.map((u: any, idx: number) => {
            const percentage = Math.min(100, Math.round((u.currentValue / u.limitValue) * 100));
            return (
              <div key={u.id || idx}>
                <div className="flex justify-between items-end mb-2 text-xs font-semibold">
                  <div>
                    <p className="text-sm font-bold text-gray-850 capitalize">{u.metric.toLowerCase().replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Threshold allocations for your plan type.</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{u.currentValue} / {u.limitValue}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-350" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
          {usage.length === 0 && (
            <div className="text-xs text-gray-400 font-semibold">No usage trackers loaded.</div>
          )}
        </div>
      </div>

      {/* Billing history table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card text-left">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900 font-display">Billing Receipts</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Invoice ID</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-semibold text-xs">
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{inv.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm text-gray-800">₹{(inv.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-semibold">No invoice copies found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice</p>
                  <p className="text-sm font-bold text-gray-800">{inv.id.slice(0, 8)}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                  Paid
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">₹{(inv.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400 font-semibold text-xs">No invoice copies found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Billing;
