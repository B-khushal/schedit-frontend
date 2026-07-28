import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

export function FreePlanBanner() {
  const { isPaidPlan, plan } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isPaidPlan) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 border-b border-amber-200/40 dark:border-amber-900/30 px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 font-medium">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50">
            <Zap className="w-3 h-3 text-amber-500" /> Free Plan
          </span>
          <span>
            You are currently using the <strong>SCHEDIT Free Plan</strong>. Unlock AI generation, unlimited accounts, content approval workflows, and advanced analytics.
          </span>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-sm transition-all hover:shadow hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </>
  );
}
