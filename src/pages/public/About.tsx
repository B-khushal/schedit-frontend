import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Cpu, Globe, Users, Award, 
  CheckCircle2, ArrowRight, Heart, Zap, Lock
} from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  return (
    <div className="space-y-24 pb-20 text-left font-sans select-none">
      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white pt-16 pb-24 border-b border-gray-800">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>About SCHEDIT Technologies</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Built to Eliminate Social Publishing Friction
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            We are empowering marketing agencies, content teams, and creators to publish Meta Reels, Stories, and posts with enterprise reliability.
          </p>
        </div>
      </section>

      {/* ── OUR STORY & MISSION ─────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 font-mono">Our Origin Story</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display tracking-tight">
            Created for Teams Demanding Uncompromising Quality
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            SCHEDIT was created to solve the persistent challenges in social media management: failed mobile Reel push notifications, broken video encoding, and clunky client approval threads scattered across emails.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            We engineered a direct Meta Graph API v18.0 container engine alongside a visual Review Studio. Today, thousands of teams rely on SCHEDIT to auto-publish Reels, Stories, and posts seamlessly.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-2xl font-extrabold text-gray-900 font-display">100%</p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">Automated Auto-Publishing</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-2xl font-extrabold text-brand-600 font-display">99.99%</p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">Meta Graph API Uptime</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
          <h3 className="text-2xl font-bold font-display text-white">Our Core Platform Values</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Native Graph API Speed</h4>
                <p className="text-xs text-gray-400 mt-1">Direct server-to-server video container publishing without fake mobile push reminders.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Enterprise Security & Encryption</h4>
                <p className="text-xs text-gray-400 mt-1">AES-256 encrypted token storage, CSRF validation, and strict role-based access control.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Client Experience First</h4>
                <p className="text-xs text-gray-400 mt-1">Clean white-label client approval portals with pin annotations and timestamped video review.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-brand-600 text-white rounded-3xl p-10 md:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-left max-w-xl">
            <h3 className="text-2xl md:text-3xl font-extrabold font-display">Join Thousands of Modern Creators</h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Experience the power of enterprise social management designed for team productivity.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-brand-700 font-extrabold text-sm rounded-xl shadow-md hover:bg-brand-50 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
