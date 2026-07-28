import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Ban, LockKeyhole, SearchX, ServerCrash, ShieldAlert } from 'lucide-react';

const errorContent = {
  401: { icon: LockKeyhole, title: 'Authentication Required', body: 'Sign in to access this SCHEDIT workspace resource.', action: 'Sign In', href: '/login' },
  403: { icon: Ban, title: 'Access Denied', body: 'Your account does not have permission to view this page or perform this action.', action: 'Go to Dashboard', href: '/app' },
  404: { icon: SearchX, title: 'Page Not Found', body: 'The page you requested does not exist or may have moved.', action: 'Go Home', href: '/' },
  429: { icon: AlertTriangle, title: 'Too Many Requests', body: 'This route is temporarily rate limited. Please wait a moment and try again.', action: 'Go Back Home', href: '/' },
  500: { icon: ServerCrash, title: 'Server Error', body: 'Something failed while processing your request. Our team can inspect this from the production logs.', action: 'System Status', href: '/status' },
  503: { icon: ShieldAlert, title: 'Service Unavailable', body: 'SCHEDIT is temporarily unavailable or undergoing maintenance.', action: 'System Status', href: '/status' },
};

export function ErrorPage({ code }: { code: keyof typeof errorContent }) {
  const copy = errorContent[code];
  const Icon = copy.icon;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-brand-300 mb-6">
          <Icon className="w-7 h-7" />
        </div>
        <p className="text-sm font-extrabold tracking-[0.25em] text-brand-300 mb-3">{code}</p>
        <h1 className="text-4xl font-extrabold font-display">{copy.title}</h1>
        <p className="mt-4 text-sm text-gray-300 leading-relaxed font-medium">{copy.body}</p>
        <Link to={copy.href} className="mt-8 inline-flex px-6 py-3 rounded-xl bg-white text-gray-950 text-sm font-extrabold hover:bg-gray-100">
          {copy.action}
        </Link>
      </div>
    </div>
  );
}
