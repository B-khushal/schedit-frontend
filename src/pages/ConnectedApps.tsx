import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Plus, RefreshCw, Unplug, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert,
  Calendar, User, Eye, Activity, KeyRound, Building, Briefcase, Link2, ShieldCheck, Info, Search,
  Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { cn, getAccountAvatar } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { UpgradeModal } from '../components/plan/UpgradeModal';
import { Button, PageHeader, Modal, PlatformIcon, Avatar } from '../components/ui';
import { API_ORIGIN } from '../config';

export function ConnectedApps() {
  const { id } = useParams();
  const { currentOrg, currentProject } = useWorkspace();
  const { isPaidPlan } = useSubscription();
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'refresh' | 'sync' | 'disconnect' | null>(null);
  const [expandedScopes, setExpandedScopes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectingId, setSelectingId] = useState<string | null>(null);

  // Avatar Edit State
  const [avatarEditAccount, setAvatarEditAccount] = useState<any | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('');
  const [savingAvatar, setSavingAvatar] = useState<boolean>(false);

  async function loadProjectDetails() {
    try {
      const [details, accounts] = await Promise.all([
        apiRequest<any>(`/api/v1/projects/${id}`),
        apiRequest<any[]>(`/api/v1/projects/${id}/social-accounts`)
      ]);
      setProject({ ...details, socialAccounts: accounts });
    } catch (err) {
      console.error('Error fetching project connections:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadProjectDetails();
    }
  }, [id]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== API_ORIGIN) return;
      if (event.data?.type === 'META_AUTH_SUCCESS') {
        loadProjectDetails();
        toastSuccess('App Connected', 'Social account has been synced to your project workspace.');
      } else if (event.data?.type === 'META_AUTH_ERROR') {
        toastError('Meta Connection Failed', event.data.error || 'Could not fetch accounts from Meta.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [id]);

  const handleSelectAccount = async (instagramAccountId: string) => {
    try {
      setSelectingId(instagramAccountId);
      await apiRequest(`/api/v1/projects/${id}/social-accounts/select`, {
        method: 'POST',
        body: JSON.stringify({ instagramAccountId }),
      });
      toastSuccess('Account Connected', 'Selected Instagram account and associated Facebook Page linked successfully.');
      await loadProjectDetails();
    } catch (err: any) {
      console.error('[ConnectedApps] Selection update failed:', err);
      toastError('Selection Failed', err.message || 'Could not select account.');
    } finally {
      setSelectingId(null);
    }
  };

  const handleConnect = async (platformKey: string) => {
    if (!isPaidPlan) {
      setShowConnectModal(false);
      setShowUpgradeModal(true);
      return;
    }

    try {
      const { url } = await apiRequest<{ url: string }>(`/api/v1/projects/${id}/social-accounts/connect`, {
        method: 'POST',
        body: JSON.stringify({ platform: platformKey }),
      });
      
      const popup = window.open(
        url,
        'Connect Social App',
        'width=600,height=700,status=no,resizable=yes,scrollbars=yes'
      );

      setShowConnectModal(false);

      const checkClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkClosed);
          loadProjectDetails();
          toastSuccess('App Connected', `Social account has been synced to your project workspace.`);
        }
      }, 1000);
    } catch (err: any) {
      toastError('Connection Failed', err.message || 'Could not initiate connection.');
    }
  };

  const handleDisconnect = async (accountId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to disconnect @${username}?`)) return;
    try {
      setActionId(accountId);
      setActionType('disconnect');
      await apiRequest(`/api/v1/projects/${id}/social-accounts/disconnect`, {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
      toastSuccess('Account Disconnected', `Removed access credentials for @${username}.`);
      loadProjectDetails();
    } catch (err: any) {
      toastError('Failed Disconnect', err.message || 'Could not disconnect account.');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleRefresh = async (accountId: string, username: string) => {
    try {
      setActionId(accountId);
      setActionType('refresh');
      await apiRequest(`/api/v1/projects/${id}/social-accounts/refresh`, {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
      toastSuccess('Tokens Refreshed', `OAuth validation refreshed for @${username}.`);
      loadProjectDetails();
    } catch (err: any) {
      toastError('Refresh Failed', err.message || 'Could not refresh account credentials.');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleSync = async (accountId: string, username: string) => {
    try {
      setActionId(accountId);
      setActionType('sync');
      await apiRequest(`/api/v1/projects/${id}/social-accounts/sync`, {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
      toastSuccess('Sync Complete', `Synchronized metrics and followers for @${username}.`);
      loadProjectDetails();
    } catch (err: any) {
      toastError('Sync Failed', err.message || 'Could not sync analytics for this account.');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const socialAccounts = project?.socialAccounts || [];
  const facebookAccounts = socialAccounts.filter((app: any) => app.platform === 'FACEBOOK');
  const instagramAccounts = socialAccounts.filter((app: any) => app.platform === 'INSTAGRAM');
  const legacyAccounts = socialAccounts.filter(
    (app: any) => app.platform !== 'FACEBOOK' && app.platform !== 'INSTAGRAM'
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 w-full animate-fade-in bg-transparent text-left select-none">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`/app/projects/${id}`} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title="Social Accounts Dashboard"
          description="Link client pages, rotate active OAuth access credentials, inspect connection health, scopes, and sync analytics."
        />
        <Button variant="primary" size="sm" onClick={() => setShowConnectModal(true)} icon={<Plus className="w-4 h-4" />} className="sm:ml-auto w-full sm:w-auto">
          Link Channel
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-semibold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-500" /> Loading account dashboard...
        </div>
      ) : socialAccounts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-gray-500 font-medium">
          No social connections configured. Click "Link Channel" to connect your first social media page.
        </div>
      ) : (
        <div className="space-y-10">
          {/* Linked Meta Accounts Section */}
          {(facebookAccounts.length > 0 || instagramAccounts.length > 0) && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 w-3 h-3 rounded-full shrink-0" />
                    Linked Meta Accounts
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">Select and manage the Instagram Business/Creator account and Facebook Page used for content scheduling.</p>
                </div>
                {instagramAccounts.length > 1 && (
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Instagram profiles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 text-gray-800 placeholder:text-gray-400 shadow-sm transition-all"
                    />
                  </div>
                )}
              </div>

              {selectingId && (
                <div className="flex items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin text-brand-500 mr-2" />
                  <span className="text-xs font-semibold text-gray-700">Updating active account link...</span>
                </div>
              )}

              {instagramAccounts.length === 0 ? (
                /* Meta Connected but No Instagram Account Empty State */
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-sm">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-gray-900">No Linked Instagram Professional Accounts Found</h3>
                    <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                      We found your Facebook connection, but there are no eligible Instagram Business or Creator accounts linked to any of your managed Facebook Pages.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-left text-xs space-y-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <Info className="w-4 h-4 text-brand-500" />
                      How to convert and link your Instagram account:
                    </h4>
                    <ol className="list-decimal pl-4 space-y-3.5 text-gray-700">
                      <li>
                        <strong className="text-gray-900 block mb-0.5">Switch to a Professional Account</strong>
                        Open the Instagram app on your mobile device, go to <span className="font-semibold text-gray-900">Settings &gt; Account Type and Tools</span>, and switch to either a <span className="font-semibold text-gray-900">Business</span> or <span className="font-semibold text-gray-900">Creator</span> account.
                      </li>
                      <li>
                        <strong className="text-gray-900 block mb-0.5">Link Instagram to your Facebook Page</strong>
                        Go to your Facebook Page, navigate to <span className="font-semibold text-gray-900">Settings &gt; Linked Accounts &gt; Instagram</span>, and connect your Instagram account there.
                      </li>
                      <li>
                        <strong className="text-gray-900 block mb-0.5">Reconnect with Permissions</strong>
                        Once linked, return here and click <strong className="text-gray-900">Reconnect Meta</strong> to refresh and display the account.
                      </li>
                    </ol>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleConnect('FACEBOOK')} 
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Reconnect Meta Account
                    </Button>
                  </div>
                </div>
              ) : (
                /* Selectable Instagram Accounts Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {instagramAccounts
                    .filter((app: any) =>
                      (app.displayName || app.accountName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (app.username || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((app: any, i: number) => {
                      const isActive = app.status === 'ACTIVE';
                      const avatar = getAccountAvatar(app);
                      const isProcessing = actionId === app.id;
                      const backingPage = facebookAccounts.find(fb => fb.platformAccountId === app.pageId);
                      const backingPageName = backingPage ? (backingPage.displayName || backingPage.accountName) : 'Unknown Page';
                      
                      // Scopes check
                      const scopes: string[] = app.permissions?.grantedScopes || [];

                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => !isActive && handleSelectAccount(app.platformAccountId)}
                          className={cn(
                            "bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative cursor-pointer group",
                            isActive 
                              ? "border-brand-500 ring-2 ring-brand-500/10 bg-brand-50/5" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className={cn("h-1.5 w-full", isActive ? "bg-brand-500" : "bg-gray-200")} />
                          
                          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Header details */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <Avatar src={app.profileImage || app.avatar} name={app.displayName || app.accountName || app.username} size="lg" />
                                  <div className="text-left">
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight truncate max-w-[130px]">
                                      {app.displayName || app.accountName}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">@{app.username}</p>
                                  </div>
                                </div>

                                {/* Radio button selection indicator */}
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name="activeInstagramAccount"
                                    checked={isActive}
                                    onChange={() => !isActive && handleSelectAccount(app.platformAccountId)}
                                    className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {/* Quick Badge Details */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                )}>
                                  {isActive ? "Active" : "Available"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase">
                                  {app.instagramAccountType || 'Business'}
                                </span>
                              </div>

                              {/* Connection details */}
                              <div className="space-y-2 py-3 border-t border-gray-100 text-xs">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Building className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                  <div className="text-left truncate">
                                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-none">Associated FB Page</p>
                                    <p className="font-semibold text-gray-700 mt-0.5 truncate">{backingPageName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <KeyRound className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                  <div className="text-left truncate">
                                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-none">Account ID</p>
                                    <p className="font-semibold text-gray-700 mt-0.5 font-mono text-[10px]">
                                      {app.platformAccountId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions block */}
                            <div className="space-y-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                                <span>Followers: <span className="text-gray-900">{app.followerCount?.toLocaleString() || 0}</span></span>
                                <span>Target: {app.publishingTarget || 'Feed'}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => handleSync(app.id, app.username)}
                                  icon={<RefreshCw className={cn("w-3 h-3", isProcessing && actionType === 'sync' && "animate-spin")} />}
                                  className="text-[10px] py-1 h-7"
                                >
                                  Sync
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => {
                                    setAvatarEditAccount(app);
                                    setNewAvatarUrl(app.profileImage || app.avatar || '');
                                  }}
                                  icon={<Camera className="w-3 h-3 text-indigo-600" />}
                                  className="text-[10px] py-1 h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                >
                                  Avatar
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => handleDisconnect(app.id, app.username)}
                                  className="sm:col-span-2 text-[10px] py-1 h-7 text-red-600 border-red-100 hover:bg-red-50"
                                  icon={<Unplug className="w-3 h-3" />}
                                >
                                  Disconnect Account
                                </Button>
                              </div>

                              <AnimatePresence>
                                {expandedScopes[app.id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-2 p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-[10px] space-y-1.5 text-left"
                                  >
                                    <p className="font-bold text-gray-400 text-[8px] uppercase tracking-wider">Granted Scopes</p>
                                    <div className="flex flex-wrap gap-0.5">
                                      {scopes.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700 text-[8px] font-mono leading-none">{s}</span>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Connected Facebook Pages */}
          {facebookAccounts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 font-display text-left">Connected Facebook Pages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {facebookAccounts.map((app: any, i: number) => {
                  const isActive = app.status === 'ACTIVE';
                  const avatar = app.profileImage || app.avatar || `https://i.pravatar.cc/150?u=facebook`;
                  const isProcessing = actionId === app.id;
                  const scopes: string[] = app.permissions?.grantedScopes || [];
                  
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative",
                        isActive ? "border-brand-500 ring-2 ring-brand-500/10 bg-brand-50/5" : "border-gray-200"
                      )}
                    >
                      <div className={cn("h-1.5 w-full", isActive ? "bg-brand-500" : "bg-gray-200")} />
                      
                      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar src={app.profileImage || app.avatar} name={app.displayName || app.accountName || app.username} size="lg" />
                                <span className="absolute -bottom-0.5 -right-0.5">
                                  <PlatformIcon platform="FACEBOOK" size="xs" />
                                </span>
                              </div>
                              <div className="text-left">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight truncate max-w-[140px]">
                                  {app.displayName || app.accountName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">@{app.username || 'fb_page'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            )}>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="space-y-2 py-3 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-2 text-gray-600">
                              <KeyRound className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              <div className="text-left truncate">
                                <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-none">Page ID</p>
                                <p className="font-semibold text-gray-700 mt-0.5 font-mono text-[10px]">
                                  {app.platformAccountId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                            <span>Likes/Followers: <span className="text-gray-900">{app.followerCount?.toLocaleString() || 0}</span></span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleSync(app.id, app.username || app.displayName)}
                              icon={<RefreshCw className={cn("w-3 h-3", isProcessing && actionType === 'sync' && "animate-spin")} />}
                              className="text-[10px] py-1 h-7"
                            >
                              Sync
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => {
                                setExpandedScopes(prev => ({ ...prev, [app.id]: !prev[app.id] }));
                              }}
                              icon={<Eye className="w-3 h-3" />}
                              className="text-[10px] py-1 h-7 border-brand-200 text-brand-700 hover:bg-brand-50"
                            >
                              Permissions
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleDisconnect(app.id, app.username || app.displayName)}
                              className="sm:col-span-2 text-[10px] py-1 h-7 text-red-600 border-red-100 hover:bg-red-50"
                              icon={<Unplug className="w-3 h-3" />}
                            >
                              Disconnect Page
                            </Button>
                          </div>

                          <AnimatePresence>
                            {expandedScopes[app.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-2 p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-[10px] space-y-1.5 text-left"
                              >
                                <p className="font-bold text-gray-400 text-[8px] uppercase tracking-wider">Granted Scopes</p>
                                <div className="flex flex-wrap gap-0.5">
                                  {scopes.map(s => (
                                    <span key={s} className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700 text-[8px] font-mono leading-none">{s}</span>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Connected Channels */}
          {legacyAccounts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 font-display text-left">Other Connected Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {legacyAccounts.map((app: any, i: number) => {
                  const isConnected = app.status === 'ACTIVE';
                  const avatar = app.profileImage || app.avatar || `https://i.pravatar.cc/150?u=${app.platform.toLowerCase()}`;
                  const isProcessing = actionId === app.id;
                  
                  let healthStatus: 'healthy' | 'warning' | 'expired' = 'healthy';
                  if (!isConnected) healthStatus = 'expired';
                  else if (app.oauthToken?.expiresAt) {
                    const daysLeft = (new Date(app.oauthToken.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24);
                    if (daysLeft < 0) healthStatus = 'expired';
                    else if (daysLeft < 7) healthStatus = 'warning';
                  }

                  const scopes: string[] = app.permissions?.grantedScopes || [];

                  return (
                    <motion.div 
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-card transition-all flex flex-col relative"
                    >
                      <div className={cn("h-1.5 w-full", 
                        healthStatus === 'healthy' ? 'bg-emerald-500' : healthStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      )} />
                      
                      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between text-left">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-200 relative shrink-0">
                              <img src={avatar} alt={app.displayName} className="w-full h-full object-cover" />
                              <span className="absolute -bottom-0.5 -right-0.5">
                                <PlatformIcon platform={app.platform} size="xs" />
                              </span>
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900 text-base leading-tight truncate max-w-[140px]">
                                {app.accountName || app.displayName}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">@{app.username}</p>
                            </div>
                          </div>
                          
                          {healthStatus === 'healthy' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-150 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Healthy
                            </span>
                          ) : healthStatus === 'warning' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-150 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Expiring
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-150 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-500" /> Expired
                            </span>
                          )}
                        </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 py-4 border-t border-b border-gray-100 my-4 text-xs">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Building className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <div className="text-left truncate">
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">Workspace</p>
                              <p className="font-semibold text-gray-700 mt-0.5 truncate">{currentOrg?.name || 'Default'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Briefcase className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <div className="text-left truncate">
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">Project</p>
                              <p className="font-semibold text-gray-700 mt-0.5 truncate">{currentProject?.name || 'Primary'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 col-span-2">
                            <KeyRound className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <div className="text-left truncate">
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">Expiry</p>
                              <p className="font-semibold text-gray-700 mt-0.5">
                                {app.oauthToken?.expiresAt ? new Date(app.oauthToken.expiresAt).toLocaleDateString() : 'Permanent'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                            <span>Followers: <span className="text-gray-900">{app.followerCount?.toLocaleString() || 0}</span></span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleSync(app.id, app.username)}
                              icon={<RefreshCw className={cn("w-3.5 h-3.5", isProcessing && actionType === 'sync' && "animate-spin")} />}
                            >
                              Sync Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => {
                                setExpandedScopes(prev => ({ ...prev, [app.id]: !prev[app.id] }));
                              }}
                              icon={<Eye className="w-3.5 h-3.5" />}
                              className="border-brand-200 text-brand-700 hover:bg-brand-50"
                            >
                              Permissions
                            </Button>
                            
                            <AnimatePresence>
                              {expandedScopes[app.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="sm:col-span-2 overflow-hidden mt-1 p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs space-y-2 text-left"
                                >
                                  <p className="font-bold text-gray-500 text-[9px] uppercase tracking-wider">Granted OAuth Scopes</p>
                                  <div className="flex flex-wrap gap-1">
                                    {scopes.map(s => (
                                      <span key={s} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 text-[9px] font-mono leading-none">{s}</span>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleDisconnect(app.id, app.username)}
                              className="sm:col-span-2 text-red-600 border-red-100 hover:bg-red-50"
                              icon={<Unplug className="w-3.5 h-3.5" />}
                            >
                              Disconnect Channel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connect app modal list */}
      <Modal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Social Page"
        description="Integrate single or multi-channel social targets into this workspace project."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Instagram Business', key: 'INSTAGRAM' },
            { name: 'Facebook Pages', key: 'FACEBOOK' },
            { name: 'LinkedIn Company', key: 'LINKEDIN' },
            { name: 'YouTube Channels', key: 'YOUTUBE' },
          ].map((plat) => (
            <button
              key={plat.key}
              onClick={() => handleConnect(plat.key)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              <PlatformIcon platform={plat.key} size="sm" />
              <span className="font-bold text-gray-800 text-sm">{plat.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Edit Profile Picture / Cloudinary Avatar Modal */}
      <Modal
        open={!!avatarEditAccount}
        onClose={() => setAvatarEditAccount(null)}
        title={`Update Profile Picture for @${avatarEditAccount?.username}`}
        description="Upload a photo or paste a Cloudinary URL to use as the permanent profile image across all mockups and views."
      >
        <div className="space-y-5 text-left">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <Avatar src={newAvatarUrl || avatarEditAccount?.profileImage} name={avatarEditAccount?.displayName || avatarEditAccount?.username} size="xl" />
            <div>
              <p className="text-sm font-bold text-gray-900">{avatarEditAccount?.displayName || avatarEditAccount?.accountName}</p>
              <p className="text-xs text-gray-500 font-mono">@{avatarEditAccount?.username}</p>
              <p className="text-[10px] text-brand-600 font-semibold mt-1">Live Avatar Preview</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Cloudinary / Image URL</label>
            <input
              type="text"
              placeholder="https://res.cloudinary.com/..."
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setAvatarEditAccount(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={savingAvatar}
              disabled={!newAvatarUrl || savingAvatar}
              onClick={async () => {
                if (!avatarEditAccount || !newAvatarUrl) return;
                setSavingAvatar(true);
                try {
                  await apiRequest(`/api/v1/projects/${id}/social-accounts/${avatarEditAccount.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ profileImage: newAvatarUrl }),
                  });
                  toastSuccess('Profile picture updated successfully!');
                  setAvatarEditAccount(null);
                  loadProjectDetails();
                } catch (err: any) {
                  toastError(err.message || 'Failed to update profile picture');
                } finally {
                  setSavingAvatar(false);
                }
              }}
              icon={<Camera className="w-4 h-4" />}
            >
              Save Profile Picture
            </Button>
          </div>
        </div>
      </Modal>

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} requiredPlan="PROFESSIONAL" />}
    </div>
  );
}
export default ConnectedApps;
