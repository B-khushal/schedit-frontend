import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

export function ForgotPassword() {
  const { success: toastSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientApiRequest('/api/v1/clients/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toastSuccess('Email Sent', 'Check your inbox for a password reset link.');
    } catch {
      // Still show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm font-medium mb-6">
                If an account exists for <strong className="text-gray-700">{email}</strong>, we've sent a password reset link.
              </p>
              <Link to="/client/login">
                <Button variant="secondary" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm font-medium mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="reset-email"
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                  disabled={loading}
                />
                <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm font-bold shadow-brand rounded-xl">
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/client/login" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
