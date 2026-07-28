import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Check, AlertCircle, Building2, FolderOpen, Loader2 } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

interface InvitationData {
  valid: boolean;
  name: string;
  email: string;
  companyName: string;
  organizationName: string;
  projects: string[];
}

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError('No invitation token provided.');
        setLoading(false);
        return;
      }
      try {
        const data = await clientApiRequest<InvitationData>(`/api/v1/clients/validate-invitation?token=${token}`);
        setInvitationData(data);
      } catch (err: any) {
        setError(err.message || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await clientApiRequest('/api/v1/clients/accept-invitation', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      toastSuccess('Account Activated!', 'Your account has been set up. You can now sign in.');
      setTimeout(() => navigate('/client/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to activate account.');
      toastError('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-10 text-center animate-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">Account Activated!</h1>
          <p className="text-gray-500 text-sm font-medium mb-6">Your password has been set. Redirecting to login...</p>
          <Link to="/client/login">
            <Button variant="primary" className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-gray-900 text-lg font-display tracking-tight leading-tight">SCHEDIT</span>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Client Portal</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-10 animate-in">
          {error && !invitationData ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
              <p className="text-gray-500 text-sm font-medium mb-6">{error}</p>
              <Link to="/client/login">
                <Button variant="secondary">Go to Login</Button>
              </Link>
            </div>
          ) : invitationData ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight mb-2">Welcome, {invitationData.name}!</h1>
              <p className="text-gray-500 text-sm font-medium mb-6">Create your password to activate your client portal access.</p>

              {/* Invitation details card */}
              <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">Company</p>
                    <p className="font-semibold text-gray-900 text-sm">{invitationData.companyName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-brand-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">Assigned Projects</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {invitationData.projects.map((p, i) => (
                        <span key={i} className="inline-flex px-2.5 py-1 bg-white border border-brand-200 text-brand-700 text-xs font-bold rounded-lg">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="new-password"
                  label="Create Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  disabled={submitting}
                />
                <Input
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  className="w-full py-3 text-sm font-bold shadow-brand rounded-xl"
                >
                  Activate Account
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default AcceptInvitation;
