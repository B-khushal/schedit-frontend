import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, KeyRound, Link2Off, MailCheck, ShieldAlert, TimerReset } from 'lucide-react';

const statusCopy = {
  'forgot-password': { icon: TimerReset, title: 'Forgot Password', body: 'Enter your workspace email and we will send a secure password reset link if an account exists.', action: 'Send Reset Link', variant: 'form' },
  'reset-password': { icon: KeyRound, title: 'Reset Password', body: 'Choose a new password using the secure reset token sent to your email.', action: 'Update Password', variant: 'form' },
  'verify-email': { icon: MailCheck, title: 'Verify Email', body: 'Enter the six-digit verification code from your inbox to finish securing your SCHEDIT account.', action: 'Verify Email', variant: 'code' },
  'magic-link': { icon: MailCheck, title: 'Magic Link', body: 'Request a secure sign-in link for passwordless workspace access.', action: 'Send Magic Link', variant: 'form' },
  'oauth-success': { icon: CheckCircle2, title: 'Account Connected', body: 'Your Meta account connection completed successfully. You can return to your workspace and select Pages or Instagram accounts.', action: 'Go to Dashboard', href: '/app' },
  'oauth-error': { icon: ShieldAlert, title: 'Meta OAuth Error', body: 'The Meta authorization flow could not be completed. Check required permissions and try connecting again from Connected Apps.', action: 'Back to Login', href: '/login' },
  'account-connected': { icon: CheckCircle2, title: 'Account Connected', body: 'Facebook Login and Instagram account authorization are ready for publishing and insights sync.', action: 'Open Connected Apps', href: '/app/projects' },
  'permission-missing': { icon: AlertTriangle, title: 'Permission Missing', body: 'A required Meta permission was not granted. Reconnect and approve Page, publishing, and insights permissions to continue.', action: 'Reconnect Account', href: '/app/projects' },
  'token-expired': { icon: TimerReset, title: 'Token Expired', body: 'Meta credentials have expired or were revoked. Reconnect the account to refresh publishing and insights access.', action: 'Reconnect Account', href: '/app/projects' },
  'account-disconnected': { icon: Link2Off, title: 'Account Disconnected', body: 'The connected account and stored OAuth tokens were removed from active SCHEDIT systems.', action: 'Return to Dashboard', href: '/app' },
};

export function AuthStatusPage({ type }: { type: keyof typeof statusCopy }) {
  const copy = statusCopy[type];
  const location = useLocation();
  const Icon = copy.icon;
  const query = new URLSearchParams(location.search);
  const message = query.get('message') || copy.body;

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-5 sm:p-8 text-left">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mb-5">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 font-display">{copy.title}</h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed font-medium">{message}</p>

        {'variant' in copy ? (
          <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
            <input
              type={copy.variant === 'code' ? 'text' : 'email'}
              placeholder={copy.variant === 'code' ? 'Six-digit code' : 'name@company.com'}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold focus:outline-none focus:border-brand-500"
            />
            {type === 'reset-password' && (
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold focus:outline-none focus:border-brand-500"
              />
            )}
            <button className="w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-extrabold hover:bg-brand-500">
              {copy.action}
            </button>
          </form>
        ) : (
          <Link to={copy.href} className="mt-6 inline-flex w-full justify-center py-3 rounded-xl bg-brand-600 text-white text-sm font-extrabold hover:bg-brand-500">
            {copy.action}
          </Link>
        )}

        <Link to="/" className="mt-5 block text-center text-xs font-bold text-gray-500 hover:text-gray-900">
          Back to schedit.in
        </Link>
      </div>
    </div>
  );
}
