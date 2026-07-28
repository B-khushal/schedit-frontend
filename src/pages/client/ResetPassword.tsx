import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Check, AlertCircle } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await clientApiRequest('/api/v1/clients/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      toastSuccess('Password Reset', 'Your password has been updated.');
      setTimeout(() => navigate('/client/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
      toastError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-10 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-500 text-sm mb-6">This password reset link is invalid or missing.</p>
          <Link to="/client/forgot-password"><Button variant="primary">Request New Link</Button></Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-10 text-center max-w-sm animate-in">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
          <p className="text-gray-500 text-sm font-medium mb-6">Redirecting to login...</p>
          <Link to="/client/login"><Button variant="primary" className="w-full">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-md">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-gray-900 text-lg font-display tracking-tight leading-tight">SCHEDIT</span>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Client Portal</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 animate-in">
          <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight mb-2">Set New Password</h1>
          <p className="text-gray-500 text-sm font-medium mb-6">Choose a strong password for your account.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="new-pwd" label="New Password" type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required disabled={loading} />
            <Input id="confirm-pwd" label="Confirm Password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required disabled={loading} />
            <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm font-bold shadow-brand rounded-xl">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default ResetPassword;
