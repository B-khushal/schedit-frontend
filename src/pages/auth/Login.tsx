import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

export function Login() {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/app';
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toastSuccess('Welcome back!', 'Successfully signed into your account.');
      if (import.meta.env.DEV || import.meta.env.VITE_AUTH_DEBUG === 'true') {
        console.info('[auth]', 'navigate-after-login', {
          at: new Date().toISOString(),
          to: from,
          reason: 'Login successful',
        });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Invalid email address or password. Please try again.';
      setError(msg);
      toastError('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex w-full font-sans bg-gray-50 selection:bg-brand-500/30">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-10">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12 group w-fit">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg font-display tracking-tight">SCHEDIT</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8 text-sm font-medium">Sign in to your account to continue.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-fade-in font-medium">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="email"
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-sm font-bold shadow-brand rounded-xl"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            Don't have an account? <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </div>

      {/* Right side - Visual panel */}
      <div className="hidden lg:flex flex-1 bg-gray-50/50 relative overflow-hidden items-center justify-center p-12 border-l border-gray-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb0a_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-100/20 via-transparent to-transparent"></div>
        
        <div className="relative z-10 w-full max-w-lg bg-white border border-gray-200/80 rounded-3xl p-8 shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SCHEDIT Suite 2026</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">The new standard for enterprise teams.</h2>
          <p className="text-gray-500 text-base leading-relaxed font-medium">
            Manage your brand presence, client review channels, version histories, and workflow schedules under a single enterprise workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
