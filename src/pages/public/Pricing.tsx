import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const plans = [
    {
      name: 'Creator / Starter',
      monthlyPrice: '₹2499',
      annualPrice: '₹2099',
      desc: 'Essential auto-publishing & AI tools for solo creators and freelancers.',
      features: [
        '5 Connected Social Accounts',
        'Instagram Reels & Stories Auto-Publish',
        'Smart Drag & Drop Calendar',
        'AI Caption & Hashtag Generator',
        '10GB Cloud Storage',
        'Standard Email Support',
      ],
      popular: false,
      ctaText: 'Start 14-Day Trial',
    },
    {
      name: 'Professional / Agency',
      monthlyPrice: '₹4899',
      annualPrice: '₹4099',
      desc: 'For growing marketing agencies and multi-brand content teams.',
      features: [
        '20 Connected Social Accounts',
        'Meta Graph API v18.0 Direct Publishing',
        'Visual Review Studio & Pin Annotations',
        'Timestamped Video Feedback Comments',
        'Team Member Roles & Approvals',
        'White-Label PDF Analytics Reports',
        '50GB Cloud Storage',
        'Priority SLA Support',
      ],
      popular: true,
      ctaText: 'Start Professional Trial',
    },
    {
      name: 'Enterprise Scale',
      monthlyPrice: '₹10,299',
      annualPrice: '₹10,000',
      desc: 'Unlimited power, dedicated white-label client portal & SLA guarantee.',
      features: [
        'Unlimited Connected Accounts',
        'Unlimited Workspaces & Clients',
        'White-Label Custom Client Portal',
        'Dedicated Success Manager',
        'Custom Webhooks & REST API Access',
        '250GB Cloud Storage',
        '99.99% Guaranteed SLA Uptime',
      ],
      popular: false,
      ctaText: 'Start Enterprise Trial',
    },
  ];

  const faqs = [
    {
      q: 'Do Instagram Reels and Stories auto-publish automatically?',
      a: 'Yes! SCHEDIT integrates natively with Meta Graph API v18.0. Video Reels and Stories auto-publish on your scheduled date without requiring manual mobile phone notifications.',
    },
    {
      q: 'Can I invite agency clients to review posts?',
      a: 'Absolutely. Professional and Enterprise plans include the visual Review Studio and Client Portals, allowing clients to pin annotations, request changes, or approve content.',
    },
    {
      q: 'What currency are the plans billed in?',
      a: 'All plans are billed in Indian Rupees (₹) with standard GST tax invoices downloadable directly from your billing portal.',
    },
    {
      q: 'Can I change plans or cancel at any time?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription anytime with 1-click in your account settings.',
    },
  ];

  return (
    <div className="w-full py-16 px-6 max-w-[1300px] mx-auto text-left font-sans select-none space-y-20">
      {/* ── HEADER & TOGGLE ─────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
          Transparent Tiered Pricing
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
          Simple, Transparent Plans for Every Team Size.
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Try any plan free for 14 days. No credit card required.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
              billingCycle === 'monthly' ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annually')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5",
              billingCycle === 'annually' ? "bg-gray-900 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">Save 20%</span>
          </button>
        </div>
      </div>

      {/* ── PRICING CARDS GRID ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative p-8 rounded-3xl border flex flex-col justify-between transition-all",
                plan.popular
                  ? "bg-gray-900 text-white border-brand-500 shadow-2xl shadow-brand-500/10 lg:-translate-y-2"
                  : "bg-white text-gray-900 border-gray-200 shadow-card"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md">
                  Most Popular for Agencies
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className={cn("text-xl font-bold font-display", plan.popular ? "text-white" : "text-gray-900")}>
                    {plan.name}
                  </h3>
                  <p className={cn("text-xs mt-1 leading-relaxed", plan.popular ? "text-gray-300" : "text-gray-500")}>
                    {plan.desc}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">{price}</span>
                  <span className={cn("text-xs font-semibold", plan.popular ? "text-gray-400" : "text-gray-500")}>/month</span>
                  {billingCycle === 'annually' && (
                    <span className="text-[10px] font-bold text-emerald-400 ml-2">Billed annually</span>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200/20 space-y-3">
                  <p className={cn("text-xs font-extrabold uppercase tracking-wider", plan.popular ? "text-gray-300" : "text-gray-400")}>
                    Included Features:
                  </p>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs font-medium">
                      <div className={cn("p-0.5 rounded-full shrink-0 mt-0.5", plan.popular ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700")}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={plan.popular ? "text-gray-200" : "text-gray-700"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-200/20">
                <Link
                  to="/register"
                  className={cn(
                    "w-full py-3.5 rounded-xl font-extrabold text-xs text-center transition-all block shadow-md",
                    plan.popular
                      ? "bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  {plan.ctaText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FAQ ACCORDION ───────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto space-y-8 pt-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-display">Frequently Asked Questions</h2>
          <p className="text-xs text-gray-500 font-medium">Have questions about subscription billing or features? We're here to help.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-gray-900 cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-gray-400 font-mono text-lg">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
