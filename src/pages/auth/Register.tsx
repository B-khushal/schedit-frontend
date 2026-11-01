import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui';

export function Register() {
  const { register } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      toastSuccess('Account created!', 'Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check details and try again.';
      setError(msg);
      toastError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex w-full font-sans bg-[var(--neu-bg)] text-[var(--neu-text-primary)] selection:bg-blue-500/20">
      {/* Left panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-20 py-10 sm:py-12">
        <div className="w-full max-w-md mx-auto neu-card p-8 sm:p-10 rounded-3xl shadow-xl">
          <Link to="/" className="flex items-center gap-2.5 mb-8 group w-fit">
            <div className="w-9 h-9 rounded-2xl neu-button flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[var(--neu-text-primary)] text-lg font-display tracking-tight">SCHEDIT</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight mb-1.5">Create an account</h1>
          <p className="text-[var(--neu-text-secondary)] mb-6 text-xs sm:text-sm font-medium">Start your 14-day free trial. No credit card required.</p>

          {error && (
            <div className="mb-6 p-4 neu-inset-sm rounded-2xl flex items-start gap-3 text-rose-500 text-xs sm:text-sm animate-fade-in font-bold">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
              disabled={loading}
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              disabled={loading}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              disabled={loading}
              hint="Must be at least 8 characters long."
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-sm font-extrabold rounded-2xl mt-2"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </form>

          <div className="mt-8 text-center text-xs sm:text-sm text-[var(--neu-text-muted)] font-medium">
            Already have an account? <Link to="/login" className="font-bold text-blue-500 hover:text-blue-600 transition-colors">Sign in</Link>
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
            Join thousands of teams scaling their social reach, content pipelines, and autonomous marketing with SchedIt.
          </p>
        </div>
      </div>
    </div>
  );
}
