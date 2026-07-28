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
    <div className="min-h-dvh flex w-full font-sans bg-gray-50 selection:bg-brand-500/30">
      {/* Left panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-10 sm:py-12">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-10 group w-fit">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg font-display tracking-tight">SCHEDIT</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8 text-sm font-medium">Start your 14-day free trial. No credit card required.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-fade-in font-medium">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
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
              className="w-full py-3 text-sm font-bold shadow-brand rounded-xl"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Start Free Trial
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Right panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gray-50/50 relative overflow-hidden items-center justify-center p-12 border-l border-gray-200">
        <div className="w-full max-w-lg">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-8">
            <div className="flex gap-1 text-brand-400 mb-4">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 fill-current text-brand-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-lg text-gray-900 font-medium mb-6 leading-relaxed">
              "SCHEDIT completely transformed how our agency handles content. We've saved countless hours and the team collaboration features are unmatched."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">SJ</div>
              <div>
                <p className="text-sm font-bold text-gray-900">Sarah Jenkins</p>
                <p className="text-xs text-gray-500">Marketing Director, TechFlow</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 justify-center uppercase tracking-wider">
            <span>Trusted By</span>
            <span className="text-gray-600">Acme Corp</span>
            <span className="text-gray-600">Globex</span>
            <span className="text-gray-600">Soyuz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
