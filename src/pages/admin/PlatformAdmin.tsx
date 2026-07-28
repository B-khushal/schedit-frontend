import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Shield,
  CreditCard,
  Activity,
  HardDrive,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  BarChart3,
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  Sliders,
  Filter,
  Check,
  X,
  FileText,
  UserPlus,
  Briefcase,
  Building,
} from 'lucide-react';

export function PlatformAdmin() {
  const { user: currentUser, startImpersonation } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clients' | 'flags' | 'health' | 'audit'>('overview');

  // Overview stats
  const [overview, setOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Users table state
  const [users, setUsers] = useState<any[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('ALL');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Clients table state
  const [clients, setClients] = useState<any[]>([]);
  const [clientTotal, setClientTotal] = useState(0);
  const [clientPage, setClientPage] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Feature flags
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoadingFlags, setIsLoadingFlags] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState<{ id: string; name: string } | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // System Health
  const [health, setHealth] = useState<any>(null);

  // Action Modals
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
  const [isLifetime, setIsLifetime] = useState(false);
  const [aiCreditsInput, setAiCreditsInput] = useState(100);
  const [extraStorageMbInput, setExtraStorageMbInput] = useState(1024);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const data = await apiRequest<any>('/api/v1/admin/overview');
      setOverview(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await apiRequest<any>(
        `/api/v1/admin/users?page=${userPage}&limit=50&search=${encodeURIComponent(userSearch)}&plan=${encodeURIComponent(userPlanFilter)}`
      );
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userPage, userSearch, userPlanFilter]);

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const data = await apiRequest<any>(
        `/api/v1/admin/clients?page=${clientPage}&limit=50&search=${encodeURIComponent(clientSearch)}`
      );
      setClients(data.clients || []);
      setClientTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load client portal users:', err);
    } finally {
      setIsLoadingClients(false);
    }
  }, [clientPage, clientSearch]);

  const fetchFlags = useCallback(async () => {
    setIsLoadingFlags(true);
    try {
      const data = await apiRequest<any[]>('/api/v1/feature-flags/all');
      setFlags(data || []);
    } catch (err) {
      console.error('Failed to load feature flags:', err);
    } finally {
      setIsLoadingFlags(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoadingAudit(true);
    try {
      let query = `/api/v1/admin/audit-logs?page=${auditPage}&limit=50`;
      if (auditUserFilter?.id) {
        query += `&userId=${encodeURIComponent(auditUserFilter.id)}`;
      }
      if (auditSearch.trim()) {
        query += `&search=${encodeURIComponent(auditSearch)}`;
      }

      const data = await apiRequest<any>(query);
      setAuditLogs(data.logs || []);
      setAuditTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  }, [auditPage, auditSearch, auditUserFilter]);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await apiRequest<any>('/api/v1/admin/health');
      setHealth(data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    }
  }, []);

  // Initial load: Fetch overview, users, clients, and health immediately
  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchClients();
    fetchHealth();
  }, [fetchOverview, fetchUsers, fetchClients, fetchHealth]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'clients') fetchClients();
    if (activeTab === 'flags') fetchFlags();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, fetchUsers, fetchClients, fetchFlags, fetchAuditLogs]);

  // Quick 1-Click Approve Free User to Paid Plan
  const handleQuickApproveUser = async (u: any, targetPlan = 'PROFESSIONAL') => {
    setActionError(null);
    try {
      await apiRequest(`/api/v1/admin/users/${u.id}/plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: targetPlan, isLifetime: false, reason: 'Quick Admin Approval' }),
      });
      setActionSuccess(`Approved ${u.name}'s account upgrade to ${targetPlan} Plan!`);
      fetchUsers();
      fetchOverview();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve user upgrade');
    }
  };

  const handleUpgradeUserPlan = async () => {
    if (!selectedUser) return;
    setActionError(null);
    try {
      await apiRequest(`/api/v1/admin/users/${selectedUser.id}/plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlan, isLifetime }),
      });
      setActionSuccess(`Successfully updated ${selectedUser.name}'s plan to ${selectedPlan}`);
      setShowPlanModal(false);
      fetchUsers();
      fetchOverview();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user plan');
    }
  };

  const handleGrantCredits = async () => {
    if (!selectedUser) return;
    setActionError(null);
    try {
      await apiRequest(`/api/v1/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        body: JSON.stringify({
          aiCredits: Number(aiCreditsInput),
          extraStorageMb: Number(extraStorageMbInput),
        }),
      });
      setActionSuccess(`Granted credits/storage to ${selectedUser.name}`);
      setShowCreditModal(false);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to grant credits');
    }
  };

  const handleToggleUserSuspend = async (u: any) => {
    const isSuspended = u.status === 'SUSPENDED';
    const endpoint = isSuspended ? 'resume' : 'suspend';
    try {
      await apiRequest(`/api/v1/admin/users/${u.id}/${endpoint}`, { method: 'POST' });
      setActionSuccess(`User ${u.name} ${isSuspended ? 'reactivated' : 'suspended'}`);
      fetchUsers();
      if (activeTab === 'clients') fetchClients();
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    }
  };

  const handleImpersonate = async (u: any) => {
    const targetUserId = u.userId || u.id;
    try {
      const resp = await apiRequest<any>(`/api/v1/admin/users/${targetUserId}/impersonate`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Platform Admin Portal Quick Impersonate' }),
      });
      if (resp.accessToken) {
        startImpersonation(resp.accessToken, resp.user);
        window.location.href = '/app';
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to impersonate user');
    }
  };

  const handleToggleFlag = async (key: string, currentEnabled: boolean, orgId?: string) => {
    try {
      await apiRequest('/api/v1/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key, enabled: !currentEnabled, organizationId: orgId }),
      });
      fetchFlags();
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  const handleFilterUserLogs = (u: any) => {
    const uid = u.userId || u.id;
    const name = u.name || u.user?.name || u.email || u.user?.email;
    setAuditUserFilter({ id: uid, name });
    setActiveTab('audit');
  };

  const totalRegisteredCount = userTotal || overview?.totalUsers || 0;
  const totalClientCount = clientTotal || overview?.totalClients || 0;

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-6 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 via-purple-50 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Platform Admin Portal
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs">
                  Global Owner
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                Inspect all registered users, approve free accounts to paid plans, manage client portal users, and filter exact audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Operational</span>
          </div>

          <button
            onClick={() => {
              fetchOverview();
              fetchUsers();
              fetchClients();
              fetchHealth();
              if (activeTab === 'flags') fetchFlags();
              if (activeTab === 'audit') fetchAuditLogs();
            }}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Refresh All Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-800 font-bold text-base">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold text-base">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Light Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1">
        {[
          { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
          { id: 'users', label: `All Users (${totalRegisteredCount})`, icon: Users },
          { id: 'clients', label: `Client Portal Users (${totalClientCount})`, icon: Briefcase },
          { id: 'flags', label: 'Feature Flags', icon: Sliders },
          { id: 'health', label: 'Infrastructure & Queues', icon: Server },
          { id: 'audit', label: 'User & System Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{totalRegisteredCount}</span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">Platform & Client portal accounts</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Revenue (MRR)</span>
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">₹{(overview?.mrr || 0).toLocaleString()}</span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">Calculated from active paid plans</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Portal Accounts</span>
                <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{totalClientCount}</span>
                <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Client CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">External client reviewers</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage Volume</span>
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{overview?.totalStorageMb || 0} MB</span>
                <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {overview?.totalAssetsCount || 0} Assets
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2">Cloud object CDN assets</p>
            </div>
          </div>

          {/* Plan Distribution & Quick Action Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Subscription Tier Distribution</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Active organization count mapped to subscription tiers.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { plan: 'FREE', title: 'Free Tier', price: '₹0/mo', bg: 'bg-slate-50 border-slate-200 text-slate-900', badge: 'bg-slate-200 text-slate-700' },
                  { plan: 'PROFESSIONAL', title: 'Professional', price: '₹2,499/mo', bg: 'bg-blue-50/50 border-blue-200 text-blue-900', badge: 'bg-blue-200 text-blue-800' },
                  { plan: 'BUSINESS', title: 'Business', price: '₹6,499/mo', bg: 'bg-indigo-50/50 border-indigo-200 text-indigo-900', badge: 'bg-indigo-200 text-indigo-800' },
                  { plan: 'ENTERPRISE', title: 'Enterprise', price: '₹24,999/mo', bg: 'bg-purple-50/50 border-purple-200 text-purple-900', badge: 'bg-purple-200 text-purple-800' },
                ].map((item) => {
                  const match = (overview?.planDistribution || []).find((p: any) => p.plan?.toUpperCase() === item.plan);
                  const count = match ? match.count : 0;
                  return (
                    <div key={item.plan} className={`p-5 rounded-2xl border ${item.bg} flex flex-col justify-between transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.badge}`}>
                          {item.plan}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{item.price}</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl font-black">{count}</div>
                        <span className="text-[11px] font-semibold opacity-75">Workspaces</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6 md:p-8 rounded-3xl text-white shadow-lg shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Platform Admin Active
                </div>
                <h3 className="text-xl font-black leading-tight">Super Administrator Privileges</h3>
                <p className="text-xs text-indigo-100 font-medium mt-2 leading-relaxed">
                  Approve free tier users to paid accounts, inspect audit logs for any user, and manage client portal accounts.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>{currentUser?.email}</span>
                <span className="px-2.5 py-1 bg-white text-indigo-900 rounded-lg">Full Owner</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & SUBSCRIPTIONS TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Table Control Header */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name, email, ID, or company..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Plan Tier Filter Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                <select
                  value={userPlanFilter}
                  onChange={(e) => {
                    setUserPlanFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full sm:w-44 py-2.5 px-3 text-xs font-bold rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="ALL">All Subscription Plans</option>
                  <option value="FREE">Free Tier Users</option>
                  <option value="PROFESSIONAL">Professional Tier</option>
                  <option value="BUSINESS">Business Tier</option>
                  <option value="ENTERPRISE">Enterprise Tier</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs font-semibold text-slate-500 shrink-0">
              <span>Showing {users.length} of {userTotal} users</span>
            </div>
          </div>

          {/* Premium Light Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Organization / Workspace</th>
                    <th className="px-6 py-4">Current Plan</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4">Usage Stats</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                        Loading platform users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                        No user records found matching search query.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                              {u.name?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isPlatformOwner && (
                                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded-md border border-amber-300/50">
                                    Owner
                                  </span>
                                )}
                                {u.isClientUser && (
                                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-purple-100 text-purple-800 rounded-md border border-purple-300/50">
                                    Client
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold">{u.email}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">{u.company}</span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide ${
                              u.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              u.plan === 'BUSINESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              u.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {u.plan}
                            </span>

                            {/* 1-Click Approve Free User to Paid Plan */}
                            {u.plan === 'FREE' && (
                              <button
                                onClick={() => handleQuickApproveUser(u, 'PROFESSIONAL')}
                                className="px-2 py-1 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-transform hover:scale-105 shadow-xs flex items-center gap-1 shrink-0"
                                title="Approve & Upgrade Free User to Professional Plan"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Approve Paid</span>
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                            u.status === 'SUSPENDED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {u.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-semibold text-[11px]">
                          <div>{u.postsCount} Posts Scheduled</div>
                          <div className="text-slate-400">{u.storageUsedMb} MB Storage</div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setSelectedPlan(u.plan === 'FREE' ? 'PROFESSIONAL' : u.plan);
                                setShowPlanModal(true);
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors border border-indigo-200/60"
                            >
                              Change Plan
                            </button>

                            <button
                              onClick={() => handleFilterUserLogs(u)}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 flex items-center gap-1"
                              title="View Exact Audit Logs for this User"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Logs</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowCreditModal(true);
                              }}
                              className="px-2 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                              title="Grant Extra AI Credits / Storage"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleImpersonate(u)}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 flex items-center gap-1"
                              title="Impersonate User"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Impersonate</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserSuspend(u)}
                              className={`p-1.5 rounded-xl transition-colors border ${
                                u.status === 'SUSPENDED'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                              }`}
                              title={u.status === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
                            >
                              {u.status === 'SUSPENDED' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Page {userPage} of {Math.ceil(userTotal / 50) || 1}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => p - 1)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={userPage >= Math.ceil(userTotal / 50)}
                  onClick={() => setUserPage((p) => p + 1)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT PORTAL USERS TABLE */}
      {activeTab === 'clients' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search client user, email, or company name..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClientPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {clients.length} of {clientTotal} client portal accounts
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Client User</th>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Assigned Projects</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoadingClients ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                        Loading client portal accounts...
                      </td>
                    </tr>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                        No client portal users found matching search query.
                      </td>
                    </tr>
                  ) : (
                    clients.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                              {c.user?.name?.substring(0, 2).toUpperCase() || 'CL'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{c.user?.name}</div>
                              <div className="text-[11px] text-slate-500 font-semibold">{c.user?.email}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">User ID: {c.user?.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-800">
                          {c.companyName}
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {c.organization?.name || 'Workspace'}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {c.assignedProjects?.length > 0 ? (
                              c.assignedProjects.map((ap: any) => (
                                <span key={ap.project?.id || ap.id} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                  {ap.project?.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px]">No projects linked</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                            c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'INVITED' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleFilterUserLogs(c)}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 flex items-center gap-1"
                              title="View Exact Audit Logs for Client"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Logs</span>
                            </button>

                            <button
                              onClick={() => handleImpersonate(c)}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 flex items-center gap-1"
                              title="Impersonate Client Portal Session"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Impersonate</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserSuspend({ id: c.userId, name: c.user?.name, status: c.user?.status })}
                              className={`p-1.5 rounded-xl transition-colors border ${
                                c.user?.status === 'SUSPENDED'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                              }`}
                              title={c.user?.status === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
                            >
                              {c.user?.status === 'SUSPENDED' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Platform Feature Flags</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enable or disable core system modules globally across all organization tenants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'AI', name: 'AI Content Generation', desc: 'AI Assistant & smart post copy generation engine' },
              { key: 'WORKFLOW', name: 'Approval Workflows', desc: 'Client & reviewer approval verification pipeline' },
              { key: 'PUBLISHING', name: 'Direct Social Publishing', desc: 'Automated post publishing queues & webhooks' },
              { key: 'ANALYTICS', name: 'Analytics & PDF Exports', desc: 'Cross-platform analytics dashboards & exports' },
              { key: 'CALENDAR', name: 'Calendar Scheduling View', desc: 'Interactive drag-and-drop scheduling calendar' },
              { key: 'INTEGRATIONS', name: 'Connected Apps & APIs', desc: 'OAuth platform accounts & developer webhooks' },
              { key: 'BETA_FEATURES', name: 'Beta Features', desc: 'Experimental preview features for early access' },
            ].map((f) => {
              const matched = flags.find((flag) => flag.key === f.key);
              const isEnabled = matched ? matched.enabled : true;

              return (
                <div key={f.key} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between hover:bg-white transition-all shadow-2xs">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{f.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFlag(f.key, isEnabled)}
                    className="p-1 text-indigo-600 hover:scale-105 transition-transform"
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-9 h-9 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM HEALTH & INFRASTRUCTURE */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Service Infrastructure Diagnostics</h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">API Gateway Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {health?.status || 'OPERATIONAL'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">PostgreSQL Relational DB</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {health?.database || 'HEALTHY'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Redis / BullMQ Background Queues</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {health?.redis || 'HEALTHY'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Process Memory & Telemetry</h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Process Uptime</span>
                <span className="font-bold text-slate-900">{health?.uptimeSeconds || 0} Seconds</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Heap Memory Allocation</span>
                <span className="font-bold text-slate-900">{health?.memory?.heapUsedMb || 0} MB</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">RSS Memory Usage</span>
                <span className="font-bold text-slate-900">{health?.memory?.rssMb || 0} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PLATFORM & USER AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Platform Audit Logs & User Telemetry</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Real-time audit entries, plan overrides, user impersonations, and administrative actions.
              </p>
            </div>

            {/* User Filter Indicator */}
            {auditUserFilter && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl text-xs font-bold shadow-2xs">
                <span>Filtered User: <strong>{auditUserFilter.name}</strong></span>
                <button
                  onClick={() => {
                    setAuditUserFilter(null);
                    setAuditPage(1);
                  }}
                  className="p-1 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600 font-bold"
                  title="Clear User Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Audit Log Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit action, target user ID, or admin email..."
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {auditLogs.length} of {auditTotal} audit log records
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingAudit ? (
              <div className="text-center py-12 text-slate-400 font-semibold">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                Loading audit log records...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold">
                No audit log records found matching query.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs hover:bg-slate-100/60 transition-colors">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                        log.action?.includes('UPGRADE') ? 'bg-emerald-100 text-emerald-800' :
                        log.action?.includes('SUSPEND') ? 'bg-rose-100 text-rose-800' :
                        log.action?.includes('IMPERSONATE') ? 'bg-amber-100 text-amber-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-800">Admin: {log.actor?.name || log.actor?.email || 'System'}</span>
                      {log.targetId && (
                        <span className="text-slate-500 font-medium">Target User ID: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">{log.targetId}</code></span>
                      )}
                    </div>
                    {log.details && (
                      <pre className="p-3 rounded-xl bg-white border border-slate-200/80 text-[10px] text-slate-700 font-mono overflow-x-auto max-w-3xl">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Change User Plan */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                Change Subscription Tier
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Updating subscription tier for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Plan Tier</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full p-3 text-xs font-semibold rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FREE">FREE (₹0/mo)</option>
                <option value="PROFESSIONAL">PROFESSIONAL (₹2,499/mo)</option>
                <option value="BUSINESS">BUSINESS (₹6,499/mo)</option>
                <option value="ENTERPRISE">ENTERPRISE (₹24,999/mo)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <input
                type="checkbox"
                id="lifetime"
                checked={isLifetime}
                onChange={(e) => setIsLifetime(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="lifetime" className="text-xs font-bold text-slate-700 cursor-pointer">
                Grant Lifetime Access (No Renewal Required)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeUserPlan}
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                Confirm Plan Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Grant Credits */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                Grant Extra Resource Quotas
              </h3>
              <button onClick={() => setShowCreditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Grant additional resource quotas to <strong>{selectedUser.name}</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">AI Generation Credits</label>
              <input
                type="number"
                value={aiCreditsInput}
                onChange={(e) => setAiCreditsInput(Number(e.target.value))}
                className="w-full p-3 text-xs font-semibold rounded-2xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Extra Storage Volume (MB)</label>
              <input
                type="number"
                value={extraStorageMbInput}
                onChange={(e) => setExtraStorageMbInput(Number(e.target.value))}
                className="w-full p-3 text-xs font-semibold rounded-2xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreditModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantCredits}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-600/20 transition-all hover:scale-105"
              >
                Grant Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
