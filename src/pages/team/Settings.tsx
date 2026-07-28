import React, { useState, useEffect } from 'react';
import { Save, Shield, Globe, Bell, Palette, Building, Key, Webhook, Sparkles, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { Button, Input, Select, PageHeader, Modal } from '../../components/ui';

export function Settings() {
  const { currentOrg, refreshWorkspace } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // General Settings State
  const [orgName, setOrgName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Security 2FA Setup state
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [showMfaModal, setShowMfaModal] = useState(false);

  // API Keys state loaded from localStorage
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; scope: string }[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Webhooks state loaded from localStorage
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string }[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState('post.published, post.failed');

  // Sync state variables
  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name);
      setLogoUrl(currentOrg.logoUrl || '');
      setTimezone(currentOrg.timezone || 'UTC');

      // Load API Keys
      const savedKeys = localStorage.getItem(`schedit_api_keys_${currentOrg.id}`);
      if (savedKeys) {
        try { setApiKeys(JSON.parse(savedKeys)); } catch { setApiKeys([]); }
      } else {
        setApiKeys([]);
      }

      // Load Webhooks
      const savedWebhooks = localStorage.getItem(`schedit_webhooks_${currentOrg.id}`);
      if (savedWebhooks) {
        try { setWebhooks(JSON.parse(savedWebhooks)); } catch { setWebhooks([]); }
      } else {
        setWebhooks([]);
      }
    }
  }, [currentOrg]);

  // Load User Profile details for MFA checks
  const checkMfaStatus = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
      setTwoFactorEnabled(userProfile.twoFactorEnabled || false);
    } catch {}
  };

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setLoading(true);
    try {
      await apiRequest(`/api/v1/organizations/${currentOrg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: orgName,
          logoUrl,
          timezone,
        }),
      });
      toastSuccess('Settings Saved', 'Organization profile configuration updated successfully.');
      refreshWorkspace();
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update organization settings.');
    } finally {
      setLoading(false);
    }
  };

  // MFA Flow
  const handleGenerateMfa = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ secret: string; qrCode: string }>('/api/v1/auth/2fa/generate', {
        method: 'POST',
      });
      setMfaSecret(data.secret);
      setQrCode(data.qrCode);
      setShowMfaModal(true);
    } catch (err: any) {
      toastError('MFA Setup Failed', err.message || 'Could not initialize MFA registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('/api/v1/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ code: verifyCode }),
      });
      toastSuccess('MFA Enabled', 'Two-factor authentication successfully configured for your profile.');
      
      // Update local storage user details
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
      userProfile.twoFactorEnabled = true;
      localStorage.setItem('user', JSON.stringify(userProfile));
      setTwoFactorEnabled(true);
      setShowMfaModal(false);
    } catch (err: any) {
      toastError('Verification Failed', err.message || 'Invalid verification token. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // API Key Generators
  const handleGenerateApiKey = () => {
    if (!newKeyName.trim() || !currentOrg) return;
    const key = `nx_${Math.random().toString(36).slice(2, 15)}_${Math.random().toString(36).slice(2, 15)}`;
    const newKey = {
      id: Math.random().toString(),
      name: newKeyName,
      key: `${key.slice(0, 8)}...`,
      scope: 'posts:write, analytics:read',
    };
    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    localStorage.setItem(`schedit_api_keys_${currentOrg.id}`, JSON.stringify(updatedKeys));
    setGeneratedKey(key);
    setNewKeyName('');
    toastSuccess('Key Created', 'Webhook API key configured successfully.');
  };

  const handleDeleteKey = (keyId: string) => {
    if (!currentOrg) return;
    const updatedKeys = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updatedKeys);
    localStorage.setItem(`schedit_api_keys_${currentOrg.id}`, JSON.stringify(updatedKeys));
    toastSuccess('Key Revoked', 'API key successfully deleted.');
  };

  // Webhooks Generators
  const handleAddWebhook = () => {
    if (!webhookUrl.trim() || !currentOrg) return;
    const newWebhook = {
      id: Math.random().toString(),
      url: webhookUrl.trim(),
      events: webhookEvents,
    };
    const updatedWebhooks = [...webhooks, newWebhook];
    setWebhooks(updatedWebhooks);
    localStorage.setItem(`schedit_webhooks_${currentOrg.id}`, JSON.stringify(updatedWebhooks));
    setWebhookUrl('');
    toastSuccess('Webhook Registered', 'New webhook listener created.');
  };

  const handleDeleteWebhook = (webId: string) => {
    if (!currentOrg) return;
    const updatedWebhooks = webhooks.filter(w => w.id !== webId);
    setWebhooks(updatedWebhooks);
    localStorage.setItem(`schedit_webhooks_${currentOrg.id}`, JSON.stringify(updatedWebhooks));
    toastSuccess('Webhook Deleted', 'Webhook listener removed.');
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'security', label: 'Security & SSO', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in bg-transparent">
      {/* Settings Navigation */}
      <div className="w-full md:w-60 shrink-0 space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-display tracking-tight mb-4 md:mb-6 px-1 md:px-3">Settings</h1>
        <div className="flex md:block gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "min-w-max md:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left cursor-pointer",
              activeTab === tab.id 
                ? "bg-white text-gray-900 shadow-card font-bold border border-gray-200" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-brand-600" : "text-gray-400")} />
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {/* Settings Details workspace container */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-card min-h-[500px] min-w-0">
        {activeTab === 'general' && (
          <form onSubmit={handleUpdateOrg} className="space-y-6 max-w-2xl text-left">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">Workspace Configuration</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage logo placements, branding and scheduled publication default timezones.</p>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Workspace Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
              
              <Input
                label="Workspace Logo Url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />

              <Select
                label="Default Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={[
                  { value: 'UTC', label: 'UTC Universal Coordinated' },
                  { value: 'America/Los_Angeles', label: 'PST Pacific Standard Time' },
                  { value: 'America/New_York', label: 'EST Eastern Standard Time' },
                  { value: 'Europe/London', label: 'GMT Greenwich Mean Time' },
                ]}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading} icon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl text-left">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">Security Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Setup Multi-Factor authentication and identity access profiles.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to prevent account takeovers.</p>
                </div>
                {twoFactorEnabled ? (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Enabled
                  </span>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleGenerateMfa}>
                    Configure
                  </Button>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Single Sign-On (SSO)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Authenticate with standard corporate identity providers like Okta/SAML.</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white border border-gray-200 px-2.5 py-1 rounded-lg">Enterprise</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6 text-left max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">API Access Tokens</h2>
              <p className="text-xs text-gray-500 mt-0.5">Integrate post schedulers, analytics databases, or CRM clients using keys.</p>
            </div>

            {generatedKey && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs space-y-2 font-medium">
                <p className="text-amber-800 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Save your API token key now
                </p>
                <p className="text-gray-600">This key will only be shown once to protect security parameters.</p>
                <div className="bg-white border border-amber-200 p-2.5 rounded font-mono select-all text-gray-900 mt-1">
                  {generatedKey}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Key Description (e.g. Zapier Integrations)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleGenerateApiKey}>
                Generate Key
              </Button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white mt-4">
              <table className="min-w-[620px] w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Key Name</th>
                    <th className="px-4 py-3">Token Hash</th>
                    <th className="px-4 py-3">Scope Permissions</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {apiKeys.map(k => (
                    <tr key={k.id}>
                      <td className="px-4 py-3 font-bold text-gray-900">{k.name}</td>
                      <td className="px-4 py-3 font-mono">{k.key}</td>
                      <td className="px-4 py-3 text-gray-500">{k.scope}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(k.id)}
                          className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 font-semibold">No developer API keys active.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6 text-left max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">Workspace Webhooks</h2>
              <p className="text-xs text-gray-500 mt-0.5">Receive real-time notifications when publications fail, reviews finish, or comments post.</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Webhook Endpoint URL"
                placeholder="https://your-domain.com/webhooks/schedit"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Select
                label="Subscribed Events"
                value={webhookEvents}
                onChange={(e) => setWebhookEvents(e.target.value)}
                options={[
                  { value: 'post.published, post.failed', label: 'All Post Events (Publish & Fail)' },
                  { value: 'post.published', label: 'Publish Success Only' },
                  { value: 'post.failed', label: 'Publish Failures Only' },
                  { value: 'approval.requested', label: 'Client Reviews Only' },
                ]}
              />
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleAddWebhook} disabled={!webhookUrl.trim()}>
                  Register Webhook
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white mt-6">
              <table className="min-w-[560px] w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Endpoint URL</th>
                    <th className="px-4 py-3">Subscribed Events</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {webhooks.map(w => (
                    <tr key={w.id}>
                      <td className="px-4 py-3 font-semibold text-gray-700 truncate max-w-xs">{w.url}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">{w.events}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteWebhook(w.id)}
                          className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {webhooks.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 font-semibold">No active webhook endpoints configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MFA Verification modal dialog */}
      <Modal
        open={showMfaModal}
        onClose={() => setShowMfaModal(false)}
        title="Setup MFA Authenticator"
        description="Scan the QR Code using Google Authenticator or Microsoft Authenticator, then enter the code."
      >
        <form onSubmit={handleVerifyMfa} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 border border-gray-150 rounded-xl bg-gray-50/30 overflow-hidden">
            {qrCode ? (
              <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3 select-none">
                <img src={qrCode} alt="2FA QR Code" className="w-36 h-36" />
              </div>
            ) : null}
            <p className="text-[11px] text-gray-500 font-semibold font-mono">Secret: {mfaSecret}</p>
          </div>

          <Input
            label="Verification code"
            placeholder="e.g. 123456"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            required
            disabled={loading}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowMfaModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Verify Code
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default Settings;
