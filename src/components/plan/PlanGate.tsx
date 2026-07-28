import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Sparkles, Lock } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface PlanGateProps {
  children: React.ReactNode;
  requiredPlan?: 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  featureKey?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function PlanGate({
  children,
  requiredPlan = 'PROFESSIONAL',
  featureKey,
  fallbackTitle = 'Available on Professional Plan',
  fallbackDescription = 'Upgrade your subscription to unlock full access to this feature. Free tier users currently have no access.',
}: PlanGateProps) {
  const { isPaidPlan, featureFlags } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  const isFeatureDisabled = featureKey && featureFlags[featureKey] === false;
  const isPlanRestricted = !isPaidPlan;

  if (!isPlanRestricted && !isFeatureDisabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative group rounded-3xl overflow-hidden font-sans">
      {/* Blurred/disabled background preview */}
      <div className="filter blur-[4px] opacity-30 pointer-events-none select-none transition-all">
        {children}
      </div>

      {/* Light Theme Overlay CTA */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md text-center">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full space-y-4 animate-fade-in flex flex-col items-center">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <span className="inline-block px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200/70">
            Available on {requiredPlan} Plan
          </span>

          <h4 className="text-lg font-black text-slate-900">
            {fallbackTitle}
          </h4>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {fallbackDescription}
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Unlock</span>
          </button>
        </div>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} requiredPlan={requiredPlan} />}
    </div>
  );
}
