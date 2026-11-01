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
    <div className="min-h-dvh flex w-full font-sans bg-[var(--neu-bg)] text-[var(--neu-text-primary)] selection:bg-blue-500/20">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-20 py-10">
        <div className="w-full max-w-md mx-auto neu-card p-8 sm:p-10 rounded-3xl shadow-xl">
          <Link to="/" className="flex items-center gap-2.5 mb-8 group w-fit">
            <div className="w-9 h-9 rounded-2xl neu-button flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[var(--neu-text-primary)] text-lg font-display tracking-tight">SCHEDIT</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-[var(--neu-text-secondary)] mb-6 text-xs sm:text-sm font-medium">Sign in to your autonomous marketing command center.</p>

          {error && (
            <div className="mb-6 p-4 neu-inset-sm rounded-2xl flex items-start gap-3 text-rose-500 text-xs sm:text-sm animate-fade-in font-bold">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-[var(--neu-text-secondary)]">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">Forgot password?</Link>
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
              className="w-full py-3 text-sm font-extrabold rounded-2xl mt-2"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-xs sm:text-sm text-[var(--neu-text-muted)] font-medium">
            Don't have an account? <Link to="/register" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </div>

      {/* Right side - Visual panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 border-l border-[var(--neu-border-inset)]/50">
        <div className="relative z-10 w-full max-w-lg neu-card rounded-3xl p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full neu-pill-inset text-blue-500 text-xs font-extrabold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous AI Marketing OS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--neu-text-primary)] font-display mb-4 tracking-tight leading-tight">
            Soft UI. Intelligent Operations.
          </h2>
          <p className="text-[var(--neu-text-secondary)] text-sm leading-relaxed font-medium">
            Manage your brand presence, autonomous campaigns, approvals, and marketing intelligence under a single cohesive Neumorphic workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
