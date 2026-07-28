import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

export function ClientLogin() {
  const { login } = useClientAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/client/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toastSuccess('Welcome back!', 'Successfully signed into the client portal.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Invalid email address or password.';
      setError(msg);
      toastError('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-gray-50 selection:bg-brand-500/30">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="flex items-center gap-2.5 mb-12 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg font-display tracking-tight leading-tight">SCHEDIT</span>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Client Portal</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight mb-2">Client Sign In</h1>
          <p className="text-gray-500 mb-8 text-sm font-medium">Sign in to review and approve your project content.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-fade-in font-medium">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="client-email"
              label="Email address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              disabled={loading}
            />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="client-password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/client/forgot-password" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">Forgot password?</Link>
              </div>
              <Input
                id="client-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600 font-medium">Remember me</label>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-sm font-bold shadow-brand rounded-xl"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Client Portal
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400 font-medium">This portal is for invited clients only.<br />Contact your agency if you need access.</p>
          </div>
        </div>
      </div>

      {/* Right side - Visual panel */}
      <div className="hidden lg:flex flex-1 bg-gray-50/50 relative overflow-hidden items-center justify-center p-12 border-l border-gray-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb0a_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100/30 via-transparent to-indigo-100/20"></div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-6">
              <Building2 className="w-3.5 h-3.5" />
              <span>Client Review Portal</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Review. Approve. Publish.</h2>
            <p className="text-gray-500 text-base leading-relaxed font-medium">
              Access your dedicated workspace to review content, leave feedback, approve posts, and track your campaign progress — all in one place.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {['Review Content', 'Leave Feedback', 'Approve Posts'].map((item, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 text-center shadow-sm">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  i === 0 ? 'bg-brand-50 text-brand-600' :
                  i === 1 ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {i === 0 ? '👁️' : i === 1 ? '💬' : '✅'}
                </div>
                <p className="text-xs font-bold text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ClientLogin;
