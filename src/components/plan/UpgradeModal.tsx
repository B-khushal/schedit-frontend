import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap, Crown } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useSubscription, SubscriptionPlanKey } from '../../contexts/SubscriptionContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface UpgradeModalProps {
  onClose: () => void;
  requiredPlan?: 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
}

export function UpgradeModal({ onClose, requiredPlan }: UpgradeModalProps) {
  const { plan: currentPlan, refreshPermissions } = useSubscription();
  const { currentOrg, refreshWorkspace } = useWorkspace();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const plans = [
    {
      id: 'FREE',
      name: 'Free Plan',
      price: '₹0',
      period: 'forever',
      description: 'Essential social scheduling for individuals',
      icon: Zap,
      features: [
        '1 Workspace',
        '0 Connected Accounts (Paid Feature)',
        '0 Scheduled Posts / month',
        '500 MB Asset Storage',
        'Standard Publishing',
      ],
      isPopular: false,
      cta: 'Current Plan',
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professional',
      price: '₹2,499',
      period: 'per month',
      description: 'Ideal for creators & growing social teams',
      icon: Sparkles,
      features: [
        '5 Workspaces',
        '10 Connected Accounts',
        '200 Scheduled Posts / month',
        '10 GB Asset Storage',
        'AI Content Generator (100 credits)',
        'Content Approval Workflow',
        'Analytics & PDF Exports',
        '5 Team Seats',
      ],
      isPopular: true,
      cta: 'Upgrade to Pro',
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      price: '₹6,499',
      period: 'per month',
      description: 'For agencies & multi-brand management',
      icon: ShieldCheck,
      features: [
        '25 Workspaces',
        '50 Connected Accounts',
        '2,000 Scheduled Posts / month',
        '100 GB Asset Storage',
        'Unlimited AI Content Generation',
        'Custom Approval Workflows',
        'Advanced Competitor Analytics',
        '25 Team Seats & Client Portal',
      ],
      isPopular: false,
      cta: 'Upgrade to Business',
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '₹24,999',
      period: 'per month',
      description: 'Full enterprise control & custom infrastructure',
      icon: Crown,
      features: [
        'Unlimited Workspaces & Accounts',
        'Unlimited Monthly Posts & Assets',
        'Custom Dedicated IP & SLA',
        'SSO & Custom Domain Integration',
        'Dedicated Success Manager',
        'Full System Audit Logs',
      ],
      isPopular: false,
      cta: 'Upgrade to Enterprise',
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    if (!currentOrg?.id) {
      setError('Please select an organization workspace first.');
      return;
    }

    setLoadingPlan(planId);
    setError(null);
    try {
      await apiRequest('/api/v1/billing/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          orgId: currentOrg.id,
          planId: planId.toLowerCase(),
        }),
      });

      // Refresh permissions and workspace state instantly!
      await refreshPermissions();
      await refreshWorkspace();

      setSuccessMessage(`Successfully upgraded to ${planId} Plan! All premium features are now unlocked.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade subscription plan');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          {requiredPlan && (
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800">
              Required Plan: {requiredPlan}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Unlock Full SCHEDIT Capabilities
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose the plan that fits your growth. Instant permission unlock without logout.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const Icon = p.icon;
            const isCurrent = p.id === currentPlan;
            const isLoadingThis = loadingPlan === p.id;

            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                  p.isPopular
                    ? 'border-brand-500 shadow-xl bg-gradient-to-b from-brand-50/40 via-white to-white dark:from-brand-950/20 dark:via-gray-900 dark:to-gray-900 ring-2 ring-brand-500/20'
                    : isCurrent
                    ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {p.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-semibold px-2 py-0.5 text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{p.price}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{p.period}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={isCurrent || isLoadingThis}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : p.isPopular
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                    }`}
                  >
                    {isLoadingThis ? 'Upgrading...' : isCurrent ? 'Active Plan' : p.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
