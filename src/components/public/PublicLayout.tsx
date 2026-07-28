import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Menu, X, ChevronRight, User, LayoutDashboard, Settings, 
  CreditCard, LogOut, CheckCircle2, Shield, ArrowRight, Layers, FileCheck, FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const { user: clientUser, logout: clientLogout, isAuthenticated: isClientAuthenticated } = useClientAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownOpen && !(e.target as HTMLElement).closest('#user-account-menu')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'About Us', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
      navigate('/login');
    } else if (isClientAuthenticated) {
      clientLogout();
      navigate('/client/login');
    }
    setUserDropdownOpen(false);
  };

  const activeUser = isAuthenticated && user ? user : (isClientAuthenticated && clientUser ? {
    name: clientUser.name,
    email: clientUser.email,
    avatar: clientUser.avatarUrl,
    avatarUrl: clientUser.avatarUrl,
    role: 'CLIENT PORTAL USER',
    isClient: true,
  } : null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-500/30 text-left select-none">
      {/* ── HEADER NAVBAR ───────────────────────────────────────── */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-none",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md py-3 shadow-xs" 
            : "bg-white py-4 shadow-2xs"
        )}
      >
        <div className="max-w-[1300px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-xl font-display tracking-tight leading-none">SCHEDIT</span>
              <span className="text-[9px] font-bold text-brand-600 tracking-widest uppercase mt-0.5">Enterprise Content Engine</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.label} 
                  to={link.path}
                  className={cn(
                    "text-sm font-semibold transition-colors relative py-1",
                    isActive ? "text-brand-600 font-bold" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="navIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" 
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Top-Right Account Menu */}
          <div className="hidden md:flex items-center gap-3">
            {activeUser ? (
              <div className="relative" id="user-account-menu">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-gray-200 hover:border-brand-300 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                    {activeUser.avatar || activeUser.avatarUrl ? (
                      <img src={activeUser.avatar || activeUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      activeUser.name?.charAt(0) || activeUser.email?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="text-left min-w-0 hidden lg:block">
                    <p className="text-xs font-bold text-gray-900 truncate">{activeUser.name || 'Account'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{activeUser.email}</p>
                  </div>
                  <User className="w-4 h-4 text-brand-600 ml-1" />
                </button>

                {/* Account Menu Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-left"
                    >
                      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/70 rounded-xl mb-1">
                        <p className="text-xs font-bold text-gray-900">{activeUser.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono truncate">{activeUser.email}</p>
                        <span className="mt-1.5 inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
                          {activeUser.role || 'WORKSPACE PRO'}
                        </span>
                      </div>

                      <div className="space-y-0.5 py-1">
                        {activeUser.isClient ? (
                          <>
                            <Link
                              to="/client/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-brand-600" />
                              <span>Client Portal Dashboard</span>
                            </Link>
                            <Link
                              to="/client/reviews"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FileCheck className="w-4 h-4 text-indigo-600" />
                              <span>Review Queue & Approvals</span>
                            </Link>
                            <Link
                              to="/client/projects"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FolderKanban className="w-4 h-4 text-emerald-600" />
                              <span>My Projects</span>
                            </Link>
                            <Link
                              to="/client/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span>Client Profile Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/app"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-brand-600" />
                              <span>Go to Workspace Dashboard</span>
                            </Link>
                            <Link
                              to="/app/workflow"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Layers className="w-4 h-4 text-indigo-600" />
                              <span>Review Studio & Workflows</span>
                            </Link>
                            <Link
                              to="/app/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span>Account Settings</span>
                            </Link>
                            <Link
                              to="/app/billing"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              <span>Organization & Billing</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link 
                  to="/client/login"
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Client Login</span>
                </Link>
                <Link 
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-brand-500 transition-all"
                >
                  <span>Get Started Free</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE MENU ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden flex flex-col justify-between pb-8 text-left"
          >
            <nav className="flex flex-col gap-5 text-base font-bold text-gray-900">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-gray-100 pb-3 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </nav>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              {activeUser ? (
                <>
                  <Link
                    to={activeUser.isClient ? "/client/dashboard" : "/app"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-center block shadow-md"
                  >
                    {activeUser.isClient ? "Go to Client Dashboard" : "Go to Workspace Dashboard"}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-gray-100 text-red-600 font-bold rounded-xl text-center block"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/client/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-center block"
                  >
                    Client Portal Login
                  </Link>
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl text-center block"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-center block shadow-md"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Public Content */}
      <main className="flex-1 pt-24">
        <Outlet />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 pt-16 pb-12 mt-20 text-left">
        <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl font-display">SCHEDIT</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Enterprise social publishing engine, automated Meta Reels & Stories, visual review studio, and client proofing platform for modern marketing teams.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold pt-2">
              <CheckCircle2 className="w-4 h-4" /> 99.99% Guaranteed Platform Uptime · SOC-2 Compliant
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 font-mono">Platform</h4>
            <ul className="space-y-2.5 text-sm text-gray-300 font-medium">
              <li><Link to="/features" className="hover:text-white transition-colors">Features Overview</Link></li>
              <li><Link to="/#features" className="hover:text-white transition-colors">Reels & Stories Auto-Publish</Link></li>
              <li><Link to="/#features" className="hover:text-white transition-colors">Review Studio & Markup</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 font-mono">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-300 font-medium">
              <li><Link to="/about" className="hover:text-white transition-colors">About SCHEDIT</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Book 1-on-1 Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 font-mono">Resources</h4>
            <ul className="space-y-2.5 text-sm text-gray-300 font-medium">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In to Workspace</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Free Account</Link></li>
              <li><Link to="/client/login" className="hover:text-white transition-colors">Client Portal Login</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1300px] mx-auto px-6 pt-12 mt-12 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} SCHEDIT Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/privacy-policy" className="hover:text-gray-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-400">Terms</Link>
            <Link to="/cookies" className="hover:text-gray-400">Cookies</Link>
            <Link to="/data-deletion" className="hover:text-gray-400">Data Deletion</Link>
            <Link to="/acceptable-use" className="hover:text-gray-400">Acceptable Use</Link>
            <Link to="/security" className="hover:text-gray-400">Security</Link>
            <Link to="/compliance" className="hover:text-gray-400">Compliance</Link>
            <Link to="/contact" className="hover:text-gray-400">Contact</Link>
            <Link to="/about" className="hover:text-gray-400">About</Link>
            <Link to="/pricing" className="hover:text-gray-400">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
