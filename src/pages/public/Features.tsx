import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, Sparkles, Layers, Calendar, BarChart3, ShieldCheck, 
  CheckCircle2, ArrowRight, Video, MessageCircle, Globe, Zap, Cpu, Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Features() {
  const coreFeatures = [
    {
      title: 'Meta Reels & Stories Auto-Publishing',
      subtitle: 'Native Graph API Integration',
      description: 'Publish Instagram Reels, Facebook Reels, and Stories automatically with zero manual app notifications or mobile reminders.',
      icon: Film,
      badge: 'Instagram & Facebook Native',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      highlights: [
        'Direct MP4 Reel video upload to Meta Graph API',
        'Story aspect ratio optimization (9:16 full bleed)',
        'Container encoding status auto-polling',
        'Sound track & audio title customization',
      ],
    },
    {
      title: 'Visual Proofing & Review Studio',
      subtitle: 'Canvas Annotations & Timecodes',
      description: 'Review video frames, pin annotations, and collect client approval feedback with frame-by-frame precision.',
      icon: Layers,
      badge: 'Client Proofing',
      color: 'bg-brand-50 text-brand-600 border-brand-200',
      highlights: [
        'Timestamped video feedback comments',
        'Visual rectangle & pin annotations on image/video canvas',
        'Role-based approval stages (Internal & Client Review)',
        'Automatic revision history tracking',
      ],
    },
    {
      title: 'Smart Calendar & Drag-Drop Queue',
      subtitle: 'Multi-Timezone Scheduling',
      description: 'Organize campaigns across weeks and months with intuitive drag-and-drop calendar rescheduling and timezone sync.',
      icon: Calendar,
      badge: 'Scheduling Engine',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      highlights: [
        'Drag-and-drop post date/time rescheduling',
        'Automatic media & account preservation on reschedule',
        'Timezone conversion & optimal posting hours',
        'Grid, List, Kanban, and Timeline workflow views',
      ],
    },
    {
      title: 'AI Content Assistant & Copilot',
      subtitle: 'Powered by Advanced AI',
      description: 'Generate engaging captions, optimize hashtags, and rewrite copy tailored for each specific platform tone in seconds.',
      icon: Sparkles,
      badge: 'AI Copilot',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      highlights: [
        'Instant multi-platform caption generation',
        'Trending hashtag recommendations',
        'Emoji optimization & readability analysis',
        'Tone of voice customization for brands',
      ],
    },
    {
      title: 'White-Label Client Portal',
      subtitle: 'Agency Client Management',
      description: 'Give clients dedicated access to review, request changes, or approve scheduled posts without accessing backend settings.',
      icon: ShieldCheck,
      badge: 'Agency Workspaces',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      highlights: [
        'Custom client login portal & magic link invites',
        'Scoped client permissions (Approve/Request Changes)',
        'Clean client review interface',
        'Multi-client organization management',
      ],
    },
    {
      title: 'Cross-Channel Analytics & Executive Reports',
      subtitle: 'Real-Time Insights',
      description: 'Track audience reach, engagement metrics, likes, shares, and watch time across all connected social channels.',
      icon: BarChart3,
      badge: 'Analytics Engine',
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      highlights: [
        'Unified audience reach & follower tracking',
        'Post performance comparative breakdown',
        'Exportable executive PDF & CSV reports',
        'Custom period filtering (Hourly, Daily, Monthly)',
      ],
    },
  ];

  return (
    <div className="space-y-24 pb-20 text-left font-sans select-none">
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white pt-16 pb-24 border-b border-gray-800">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider"
          >
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Complete Feature Suite</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Built for Modern Agencies, Brands & Content Teams
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to create, review, schedule, and auto-publish content across Instagram, Facebook, LinkedIn, and YouTube.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Start Free 14-Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-sm rounded-xl border border-gray-700 transition-all"
            >
              Book Live 1-on-1 Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID SECTION ────────────────────────────────── */}
      <section className="max-w-[1300px] mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight">
            Comprehensive Platform Capabilities
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium">
            Explore how SCHEDIT streamlines your end-to-end publishing pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-3xl p-7 shadow-card hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs", feat.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">{feat.title}</h3>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">{feat.subtitle}</p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    {feat.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <Link
                    to="/register"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 group"
                  >
                    <span>Try {feat.title.split(' ')[0]} Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 rounded-3xl p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-left max-w-xl">
            <h3 className="text-2xl md:text-3xl font-extrabold font-display">Ready to Automate Your Social Workflow?</h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Join top agencies and brands using SCHEDIT to publish Reels, Stories, and posts with zero stress.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-brand-700 font-extrabold text-sm rounded-xl shadow-md hover:bg-brand-50 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
