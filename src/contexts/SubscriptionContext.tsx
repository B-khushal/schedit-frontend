import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../lib/api';
import { useWorkspace } from './WorkspaceContext';
import { useAuth } from './AuthContext';

export type SubscriptionPlanKey = 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';

export interface PlanLimits {
  workspaces: number;
  socialAccounts: number;
  scheduledPostsMonth: number;
  assetStorageMb: number;
  teamMembers: number;
  aiQuotaMonth: number;
  workflow: boolean;
  analyticsExport: boolean;
}

export interface SubscriptionState {
  plan: SubscriptionPlanKey;
  status: string;
  isPaidPlan: boolean;
  limits: PlanLimits;
  usage: {
    socialAccountsCount: number;
    scheduledPostsCount: number;
    teamMembersCount: number;
    storageUsedMb: number;
  };
  featureFlags: Record<string, boolean>;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const DEFAULT_LIMITS: Record<SubscriptionPlanKey, PlanLimits> = {
  FREE: {
    workspaces: 1,
    socialAccounts: 0,
    scheduledPostsMonth: 0,
    assetStorageMb: 500,
    teamMembers: 1,
    aiQuotaMonth: 0,
    workflow: false,
    analyticsExport: false,
  },
  PROFESSIONAL: {
    workspaces: 5,
    socialAccounts: 10,
    scheduledPostsMonth: 200,
    assetStorageMb: 10240,
    teamMembers: 5,
    aiQuotaMonth: 100,
    workflow: true,
    analyticsExport: true,
  },
  BUSINESS: {
    workspaces: 25,
    socialAccounts: 50,
    scheduledPostsMonth: 2000,
    assetStorageMb: 102400,
    teamMembers: 25,
    aiQuotaMonth: 1000,
    workflow: true,
    analyticsExport: true,
  },
  ENTERPRISE: {
    workspaces: 999,
    socialAccounts: 999,
    scheduledPostsMonth: 99999,
    assetStorageMb: 999999,
    teamMembers: 999,
    aiQuotaMonth: 99999,
    workflow: true,
    analyticsExport: true,
  },
};

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { currentOrg } = useWorkspace();
  const { user, isAuthenticated } = useAuth();

  const [plan, setPlan] = useState<SubscriptionPlanKey>('FREE');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usage, setUsage] = useState({
    socialAccountsCount: 0,
    scheduledPostsCount: 0,
    teamMembersCount: 1,
    storageUsedMb: 0,
  });

  const isPlatformUser = user?.isPlatformOwner || user?.isPlatformAdmin || user?.email?.toLowerCase() === 'khushalprasad242@gmail.com';

  const refreshPermissions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      if (currentOrg?.id) {
        // Fetch org subscription details
        const subData = await apiRequest<any>(`/api/v1/billing/subscription?orgId=${currentOrg.id}`).catch(() => null);
        const rawPlan = (currentOrg.subscriptionPlan || subData?.planId || 'FREE').toUpperCase();
        const planKey = (['FREE', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'].includes(rawPlan) ? rawPlan : 'FREE') as SubscriptionPlanKey;
        
        setPlan(isPlatformUser ? 'ENTERPRISE' : planKey);
        if (subData?.status) setStatus(subData.status);

        // Fetch usage data
        const usageData = await apiRequest<any[]>(`/api/v1/billing/usage?orgId=${currentOrg.id}`).catch(() => []);
        if (Array.isArray(usageData)) {
          const accountsTracker = usageData.find(u => u.metric === 'CONNECTED_ACCOUNTS');
          const postsTracker = usageData.find(u => u.metric === 'SCHEDULED_POSTS');
          const teamTracker = usageData.find(u => u.metric === 'TEAM_MEMBERS');

          setUsage({
            socialAccountsCount: accountsTracker?.used || 0,
            scheduledPostsCount: postsTracker?.used || 0,
            teamMembersCount: teamTracker?.used || 1,
            storageUsedMb: 0,
          });
        }
      }

      // Fetch feature flags
      const flags = await apiRequest<Record<string, boolean>>('/api/v1/feature-flags').catch(() => ({}));
      setFeatureFlags(flags);

    } catch (err) {
      console.warn('Subscription refresh notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, isAuthenticated, isPlatformUser]);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const limits = useMemo(() => {
    if (isPlatformUser) return DEFAULT_LIMITS.ENTERPRISE;
    return DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.FREE;
  }, [plan, isPlatformUser]);

  const isPaidPlan = useMemo(() => {
    return isPlatformUser || plan !== 'FREE';
  }, [plan, isPlatformUser]);

  const value = useMemo<SubscriptionState>(() => ({
    plan: isPlatformUser ? 'ENTERPRISE' : plan,
    status,
    isPaidPlan,
    limits,
    usage,
    featureFlags,
    isLoading,
    refreshPermissions,
  }), [plan, status, isPaidPlan, limits, usage, featureFlags, isLoading, isPlatformUser, refreshPermissions]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
