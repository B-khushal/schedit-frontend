import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Database, FileText, Mail, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { APP_URL } from '../../config';

type PageKey =
  | 'privacy-policy'
  | 'terms'
  | 'cookies'
  | 'data-deletion'
  | 'acceptable-use'
  | 'security'
  | 'compliance'
  | 'status'
  | 'docs'
  | 'api';

const legalPages: Record<PageKey, { title: string; eyebrow: string; summary: string; updated: string; sections: { title: string; body: string[] }[] }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    eyebrow: 'Data Protection',
    updated: 'July 27, 2026',
    summary: 'How SCHEDIT collects, uses, secures, and deletes data for workspaces, clients, Facebook Login, Instagram Graph API integrations, publishing workflows, and analytics.',
    sections: [
      {
        title: 'Information we collect',
        body: [
          'We collect account profile details, workspace membership, project settings, scheduled content, uploaded media metadata, approval activity, support requests, billing records, audit logs, and device or session information needed to operate the service.',
          'When you connect Meta products, SCHEDIT receives Facebook Page, Instagram Business or Creator account, account identifier, profile image, username, granted permission, access token, token expiry, media identifier, publishing status, and insights data authorized through Facebook Login and the Instagram Graph API.',
        ],
      },
      {
        title: 'How we use Meta data',
        body: [
          'Meta data is used only to authenticate connected accounts, list available Pages and Instagram accounts, publish scheduled posts, Reels and Stories, retrieve media and publishing status, measure insights, generate reports, and detect expired or missing permissions.',
          'OAuth tokens are encrypted at rest and are never sold, rented, or used for unrelated advertising. SCHEDIT does not post content unless an authorized workspace user schedules, approves, or directly publishes that content.',
        ],
      },
      {
        title: 'Infrastructure and service providers',
        body: [
          'SCHEDIT may use Cloudflare for DNS, CDN, TLS and abuse protection; PostgreSQL for primary data storage; Redis for queues and job state; Cloudinary or compatible object storage for media assets; email providers for transactional notifications; and payment processors for subscriptions.',
          'Providers are used under confidentiality, security, and data processing obligations appropriate to their role.',
        ],
      },
      {
        title: 'Cookies, retention, and rights',
        body: [
          'We use essential cookies or browser storage for authentication, CSRF protection, session continuity, preferences, and fraud prevention. Optional analytics or product telemetry may be used to understand performance and reliability.',
          'Depending on your location, you may request access, correction, export, restriction, objection, or deletion. Send requests to privacy@schedit.in or use the Data Deletion page.',
        ],
      },
      {
        title: 'Security and contact',
        body: [
          'SCHEDIT applies HTTPS, HSTS, secure cookies, role-based access controls, encrypted token storage, audit logging, rate limiting, origin checks, and OAuth state validation to protect user and platform data.',
          'For privacy questions, contact privacy@schedit.in. For security reports, contact security@schedit.in.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Customer Agreement',
    updated: 'July 27, 2026',
    summary: 'The terms governing access to SCHEDIT workspaces, subscriptions, publishing tools, analytics, client portals, and connected social platform integrations.',
    sections: [
      {
        title: 'Platform usage',
        body: [
          'You may use SCHEDIT to plan, create, approve, publish, and analyze social content for accounts you own or are authorized to manage. You are responsible for keeping workspace membership, roles, and connected account permissions accurate.',
          'You must follow Meta Platform Terms, Instagram Platform rules, applicable laws, and any network-specific content, advertising, and rate-limit requirements.',
        ],
      },
      {
        title: 'Subscriptions, billing, and refunds',
        body: [
          'Paid plans renew according to the billing cycle selected during checkout unless canceled before renewal. Usage limits, connected account limits, and premium features vary by plan.',
          'Refunds are reviewed case by case for billing error, duplicate charge, or service-impacting issue. Fees for completed billing periods and consumed usage are generally non-refundable unless required by law.',
        ],
      },
      {
        title: 'Ownership, API usage, and termination',
        body: [
          'Customers retain ownership of uploaded media, captions, creative assets, comments, schedules, and reports. SCHEDIT receives a limited license to process that content only to provide, secure, and improve the service.',
          'You may not bypass access controls, overload the API, scrape private data, resell access without authorization, or use automation to violate platform rules. SCHEDIT may apply rate limits and suspend abusive traffic.',
          'SCHEDIT may suspend or terminate access for non-payment, security risk, illegal activity, platform abuse, or material breach. Questions can be sent to legal@schedit.in.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    eyebrow: 'Browser Storage',
    updated: 'July 27, 2026',
    summary: 'SCHEDIT uses cookies and local browser storage to keep sessions secure, remember preferences, protect forms, and measure service reliability.',
    sections: [
      { title: 'Essential cookies', body: ['Essential storage supports login, refresh tokens, CSRF protections, secure redirects, fraud prevention, and workspace routing. These controls are required for the application to work.'] },
      { title: 'Preference and analytics storage', body: ['Preference storage may remember interface choices such as selected workspace, filters, calendars, notification settings, and dismissed banners. Diagnostics may collect aggregated product performance, error state, and uptime data.'] },
      { title: 'Managing cookies', body: ['You can delete or block cookies in your browser. Blocking essential cookies will prevent sign-in, OAuth connection, client portal access, and secure workspace activity.'] },
    ],
  },
  'data-deletion': {
    title: 'Data Deletion',
    eyebrow: 'Meta Requirement',
    updated: 'July 27, 2026',
    summary: 'Request deletion of connected social accounts, encrypted OAuth tokens, workspace data, scheduled posts, assets, analytics, reports, or your full SCHEDIT user account.',
    sections: [
      {
        title: 'What can be deleted',
        body: [
          'You may request deletion of connected Facebook Pages and Instagram accounts, encrypted OAuth tokens, scheduled posts, uploaded assets, analytics, generated reports, client portal records, workspace data, and user account profile data.',
          'Disconnecting a Meta account removes stored platform tokens and prevents future publishing or insights sync for that account. Full account deletion removes active workspace data unless retention is legally required.',
        ],
      },
      {
        title: 'How to submit a request',
        body: [
          'Submit the secure request form below or email privacy@schedit.in with the subject "Data Deletion Request". Include your account email and whether you want connected account deletion, workspace deletion, or full account deletion.',
          'We verify ownership before deletion and provide confirmation when the request is completed. Most requests are completed within 30 days unless a shorter legal period applies.',
        ],
      },
      {
        title: 'GDPR and retention notice',
        body: [
          'Deletion requests are handled according to GDPR principles and applicable privacy law. Some records may be retained for billing, security investigation, abuse prevention, backup integrity, dispute resolution, or legal compliance.',
          'Backup copies age out under standard retention schedules and are not restored to active service except for disaster recovery or legal necessity.',
        ],
      },
    ],
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    eyebrow: 'Platform Safety',
    updated: 'July 27, 2026',
    summary: 'This policy keeps SCHEDIT safe for customers, reviewers, social platforms, and the public.',
    sections: [
      { title: 'Prohibited content and behavior', body: ['You may not use SCHEDIT for illegal activity, harassment, hate, sexual exploitation, malware, phishing, impersonation, spam, platform manipulation, rights infringement, or content that violates connected platform policies.'] },
      { title: 'Automation and API abuse', body: ['You may not bypass rate limits, create fake engagement, scrape private information, reverse engineer controls, use stolen tokens, or connect accounts you do not administer.'] },
      { title: 'Enforcement', body: ['SCHEDIT may remove content, disable integrations, throttle API access, suspend workspaces, or terminate accounts where risk, abuse, or legal exposure is present.'] },
    ],
  },
  security: {
    title: 'Security',
    eyebrow: 'Trust Center',
    updated: 'July 27, 2026',
    summary: 'SCHEDIT is designed around secure authentication, encrypted tokens, production-only HTTPS, and auditable workspace access.',
    sections: [
      { title: 'Application security', body: ['SCHEDIT enforces HTTPS, HSTS, secure and HTTPOnly cookies where server-side sessions are used, SameSite protections, CSP, origin validation, rate limiting, DTO validation, OAuth state checks, encrypted token storage, and role-based authorization.'] },
      { title: 'Data and operational security', body: ['Meta OAuth tokens and sensitive integration secrets are encrypted at rest. Production secrets must be supplied through a deployment secret manager, never committed to source control. Health checks, queue monitoring, audit logs, backups, and incident triage support production operations.'] },
      { title: 'Report a vulnerability', body: ['Email security@schedit.in with a reproducible report. We acknowledge credible reports promptly and prioritize issues by severity and exploitability.'] },
    ],
  },
  compliance: {
    title: 'Compliance',
    eyebrow: 'Governance',
    updated: 'July 27, 2026',
    summary: 'SCHEDIT supports responsible data handling for SaaS workspaces, client approvals, Meta App Review, and privacy requests.',
    sections: [
      { title: 'Privacy governance', body: ['SCHEDIT supports GDPR-style access, correction, export, objection, restriction, and deletion workflows. Data processing is limited to documented business purposes.'] },
      { title: 'Meta App Review readiness', body: ['Reviewers can create an account, connect Facebook Login, connect Instagram Business or Creator accounts, select Pages, schedule and publish content, view insights, disconnect accounts, and request deletion using production URLs.'] },
      { title: 'Vendor governance', body: ['Cloudflare, PostgreSQL, Redis, storage, email, payment, and analytics vendors are assessed for security role, data scope, retention, and operational necessity.'] },
    ],
  },
  status: {
    title: 'System Status',
    eyebrow: 'Operations',
    updated: 'July 27, 2026',
    summary: 'Production availability for the SCHEDIT web app, API, queue workers, publishing engine, and Meta integrations.',
    sections: [
      { title: 'Current status', body: ['All core production components are expected to be available at launch. API health is exposed at https://api.schedit.in/health and version details are exposed at https://api.schedit.in/version.'] },
      { title: 'Incident communication', body: ['Operational incidents are communicated through support channels and customer account contacts. For urgent issues, email support@schedit.in.'] },
    ],
  },
  docs: {
    title: 'Documentation',
    eyebrow: 'Guides',
    updated: 'July 27, 2026',
    summary: 'Production documentation entry point for SCHEDIT workspace setup, Meta connection, publishing, analytics, reports, and client review workflows.',
    sections: [
      { title: 'Reviewer workflow', body: ['Create an account, open the workspace dashboard, create or select a project, connect Facebook or Instagram from Connected Apps, choose an Instagram account, create a post, schedule or publish, and inspect analytics after sync.'] },
      { title: 'Support', body: ['Documentation requests and onboarding questions can be sent to support@schedit.in. API reference is available at https://api.schedit.in/api/docs.'] },
    ],
  },
  api: {
    title: 'API',
    eyebrow: 'Developer Access',
    updated: 'July 27, 2026',
    summary: 'The SCHEDIT production API is available at https://api.schedit.in with authenticated workspace endpoints under /api/v1.',
    sections: [
      { title: 'Base URL', body: ['Use https://api.schedit.in for all production API calls. Swagger documentation is available at https://api.schedit.in/api/docs.'] },
      { title: 'Authentication', body: ['Workspace API calls require bearer token authentication. Meta OAuth callback handling uses https://api.schedit.in/api/auth/meta/callback for App Review configuration.'] },
    ],
  },
};

export function LegalPage({ pageKey }: { pageKey: PageKey }) {
  const page = legalPages[pageKey];
  const [submitted, setSubmitted] = useState(false);
  const canonical = useMemo(() => `${APP_URL}/${pageKey}`, [pageKey]);

  return (
    <div className="bg-gray-50 text-left">
      <section className="bg-gray-950 text-white border-b border-gray-800">
        <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold uppercase tracking-wider">
            <FileText className="w-4 h-4 text-brand-300" />
            <span>{page.eyebrow}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight">{page.title}</h1>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl leading-relaxed font-medium">{page.summary}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-semibold">
            <span>Last updated: {page.updated}</span>
            <span>Canonical: {canonical}</span>
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">Legal Center</h2>
            <nav className="space-y-1 text-sm font-semibold">
              {Object.entries(legalPages).slice(0, 7).map(([slug, item]) => (
                <Link key={slug} to={`/${slug}`} className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="lg:col-span-9 space-y-6">
          {pageKey === 'data-deletion' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">Delete Request Form</h2>
                  <p className="text-xs text-gray-500 font-medium">Requests are routed to privacy@schedit.in for verification.</p>
                </div>
              </div>
              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Your deletion request has been captured. Our privacy team will verify ownership before processing.</span>
                </div>
              ) : (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                  <input required type="email" placeholder="Account email" className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:border-brand-500" />
                  <select className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:border-brand-500">
                    <option>Delete connected Meta accounts and tokens</option>
                    <option>Delete workspace data</option>
                    <option>Delete scheduled posts and assets</option>
                    <option>Delete analytics and reports</option>
                    <option>Delete full user account</option>
                  </select>
                  <textarea required rows={4} placeholder="Describe your request" className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold resize-none focus:outline-none focus:border-brand-500" />
                  <button type="submit" className="md:col-span-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-950 text-white text-sm font-extrabold hover:bg-gray-800">
                    <Send className="w-4 h-4" />
                    Submit Deletion Request
                  </button>
                </form>
              )}
            </div>
          )}

          {page.sections.map((section) => (
            <section key={section.title} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-gray-600 leading-relaxed font-medium">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Secure by default', text: 'HTTPS, HSTS, encrypted tokens, and role controls.' },
              { icon: Database, title: 'Data rights', text: 'Access, correction, export, and deletion workflows.' },
              { icon: Mail, title: 'Contact', text: 'privacy@schedit.in and support@schedit.in.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-gray-900 text-white rounded-2xl p-5 border border-gray-800">
                  <Icon className="w-5 h-5 text-brand-300 mb-3" />
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
