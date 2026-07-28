import React, { useState } from 'react';
import { 
  ArrowRight, Sparkles, BarChart3, CalendarDays, Layers, Film, Users, 
  ShieldCheck, CheckCircle2, Zap, Play, Eye, Star, Globe, Cpu, ChevronRight, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlatformIcon } from '../../components/ui';
import { cn } from '../../lib/utils';

export function Home() {
  const [activeTab, setActiveTab] = useState<'reels' | 'review' | 'calendar' | 'ai' | 'analytics'>('reels');

  const demoScreens = {
    reels: {
      title: 'Meta Reels & Stories Auto-Publishing',
      subtitle: 'Native Graph API integration without mobile app popups.',
      desc: 'Schedule vertical video Reels and Stories directly to Meta Graph API. SCHEDIT auto-encodes video containers, formats JPEG Story images, and monitors publishing status in real time.',
      badge: 'Instagram & Facebook Native',
      color: 'from-purple-600 to-indigo-600',
    },
    review: {
      title: 'Visual Proofing & Review Studio',
      subtitle: 'Frame-by-frame video annotations and approval stages.',
      desc: 'Collaborate with team members and agency clients. Pin annotations directly on images and videos, submit timestamped comments, and track revision history seamlessly.',
      badge: 'Client & Team Workflows',
      color: 'from-brand-600 to-blue-600',
    },
    calendar: {
      title: 'Interactive Multi-Channel Calendar',
      subtitle: 'Drag-and-drop rescheduling across timezones.',
      desc: 'Manage month-long content pipelines. Reschedule posts in seconds with full media and platform link preservation.',
      badge: 'Queue & Drag-Drop Engine',
      color: 'from-emerald-600 to-teal-600',
    },
    ai: {
      title: 'AI Content Assistant & Copilot',
      subtitle: 'Instant caption generation, tone matching & hashtag optimization.',
      desc: 'Craft high-converting captions customized for each platform tone. AI auto-recommends trending hashtags, emojis, and call-to-actions.',
      badge: 'AI Copilot 2.0',
      color: 'from-amber-600 to-orange-600',
    },
    analytics: {
      title: 'Cross-Channel Executive Analytics',
      subtitle: 'Audience reach, engagement rates & PDF exports.',
      desc: 'Gain deep insights across connected social profiles. Track follower growth, reach metrics, and generate white-label PDF reports for stakeholders.',
      badge: 'Unified Reporting',
      color: 'from-rose-600 to-pink-600',
    },
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 text-gray-900 font-sans text-left select-none">
      
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <section className="w-full max-w-[1300px] px-6 pt-12 pb-20 md:py-28 flex flex-col items-center text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold uppercase tracking-wider mb-6 shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>SCHEDIT Enterprise Platform v2.4</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold text-gray-900 tracking-tight font-display max-w-5xl leading-[1.08]"
        >
          Automate Reels, Stories & Posts From One <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700">Unified Publishing Engine.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl font-medium leading-relaxed"
        >
          The complete social management suite for agencies, brands, and creators. Schedule Meta Reels, conduct visual client proofing, and track real-time analytics.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link 
            to="/register" 
            className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-extrabold text-base shadow-xl shadow-brand-600/20 hover:bg-brand-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/contact" 
            className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold text-base shadow-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <span>Schedule Enterprise Demo</span>
          </Link>
        </motion.div>

        {/* Platform Icons strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-bold uppercase tracking-wider"
        >
          <span>Supported Channels:</span>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-gray-800"><PlatformIcon platform="INSTAGRAM" size="xs" /> Instagram</div>
            <div className="flex items-center gap-1.5 text-gray-800"><PlatformIcon platform="FACEBOOK" size="xs" /> Facebook</div>
            <div className="flex items-center gap-1.5 text-gray-800"><PlatformIcon platform="LINKEDIN" size="xs" /> LinkedIn</div>
            <div className="flex items-center gap-1.5 text-gray-800"><PlatformIcon platform="YOUTUBE" size="xs" /> YouTube</div>
          </div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE WORKSPACE DEMO SHOWCASE ─────────────────── */}
      <section className="w-full max-w-[1300px] px-6 pb-24">
        <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-2xl space-y-6">
          {/* Tab Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-gray-150">
            {[
              { id: 'reels', label: 'Reels & Stories', icon: Film },
              { id: 'review', label: 'Review Studio', icon: Layers },
              { id: 'calendar', label: 'Smart Calendar', icon: CalendarDays },
              { id: 'ai', label: 'AI Copilot', icon: Sparkles },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border",
                    isSelected 
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Screen Card */}
          <div className="bg-gray-900 rounded-2xl p-6 md:p-10 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 bg-white/10 text-brand-300 border border-white/20 rounded-full">
                {demoScreens[activeTab].badge}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold font-display leading-tight">
                {demoScreens[activeTab].title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                {demoScreens[activeTab].desc}
              </p>
              <div className="pt-2">
                <Link 
                  to="/features" 
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-400 hover:text-brand-300 underline"
                >
                  <span>Explore Feature Specifications</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-gray-950 border border-gray-800 rounded-2xl p-6 aspect-[16/10] flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-gray-400 ml-2">SCHEDIT Live Workspace</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", demoScreens[activeTab].color)}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white">{demoScreens[activeTab].title}</h4>
                <p className="text-xs text-gray-400 max-w-md">{demoScreens[activeTab].subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS COUNTER BANNER ──────────────────────────────── */}
      <section className="w-full bg-white border-y border-gray-200 py-12">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 font-display">10M+</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Posts Published</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 font-display">99.99%</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Meta API Uptime</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 font-display">5,000+</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Agencies & Brands</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-extrabold text-brand-600 font-display">₹1.2Cr+</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Hours Saved</p>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ──────────────────────────────────── */}
      <section id="features" className="w-full py-28 max-w-[1300px] mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Built to Replace Fragmented Tools
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base font-medium">
            Everything your team needs to plan, draft, review, and auto-publish content smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Reels & Stories Engine',
              desc: 'Direct auto-publishing of MP4 Reel videos and full-screen vertical Stories via official Meta Graph API v18.0.',
              icon: Film,
              color: 'bg-purple-50 text-purple-600 border-purple-200',
            },
            {
              title: 'Visual Review Studio',
              desc: 'Frame-by-frame video proofing, pin annotations, client magic links, and approval stage management.',
              icon: Layers,
              color: 'bg-brand-50 text-brand-600 border-brand-200',
            },
            {
              title: 'Drag-and-Drop Calendar',
              desc: 'Intuitively reschedule posts while preserving attached Cloudinary media and platform links automatically.',
              icon: CalendarDays,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            },
            {
              title: 'AI Caption Copilot',
              desc: 'Generate captivating captions, trending hashtags, and platform-specific copy variants instantly.',
              icon: Sparkles,
              color: 'bg-amber-50 text-amber-600 border-amber-200',
            },
            {
              title: 'White-Label Client Portal',
              desc: 'Provide your agency clients a branded portal to review and approve posts without accessing backend settings.',
              icon: ShieldCheck,
              color: 'bg-blue-50 text-blue-600 border-blue-200',
            },
            {
              title: 'Executive Analytics',
              desc: 'Track cross-channel reach, engagement, likes, and watch time with exportable PDF reports.',
              icon: BarChart3,
              color: 'bg-rose-50 text-rose-600 border-rose-200',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.title} 
                className="bg-white border border-gray-200 rounded-3xl p-8 shadow-card hover:shadow-xl transition-all space-y-4 text-left"
              >
                <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs", item.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────────── */}
      <section className="w-full max-w-[1200px] px-6 pb-28">
        <div className="bg-gray-900 text-white rounded-3xl p-10 md:p-16 shadow-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-3xl md:text-4xl font-extrabold font-display">Start Publishing Faster Today</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              No credit card required for 14-day trial. Instant access to all Meta Reels, Stories, AI, and Review features.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              to="/register"
              className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
