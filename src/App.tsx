/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/public/PublicLayout';
import { SkeletonDashboard } from './components/ui/Skeleton';

import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Pricing } from './pages/public/Pricing';
import { LegalPage } from './pages/public/LegalPages';
import { AuthStatusPage } from './pages/auth/AuthStatusPages';
import { ErrorPage } from './pages/errors/ErrorPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Lazy-loaded App Pages for code splitting
// Lazy-loaded App Pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const CreatePost = lazy(() => import('./pages/CreatePost').then(m => ({ default: m.CreatePost })));
const Workflow = lazy(() => import('./pages/publish/Workflow').then(m => ({ default: m.Workflow })));
const WorkflowDetail = lazy(() => import('./pages/publish/WorkflowDetail').then(m => ({ default: m.WorkflowDetail })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const AIAssistant = lazy(() => import('./pages/AIAssistant').then(m => ({ default: m.AIAssistant })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const ProjectOverview = lazy(() => import('./pages/ProjectOverview').then(m => ({ default: m.ProjectOverview })));
const ConnectedApps = lazy(() => import('./pages/ConnectedApps').then(m => ({ default: m.ConnectedApps })));
const APIConnections = lazy(() => import('./pages/APIConnections').then(m => ({ default: m.APIConnections })));
const Team = lazy(() => import('./pages/team/Team').then(m => ({ default: m.Team })));
const Billing = lazy(() => import('./pages/team/Billing').then(m => ({ default: m.Billing })));
const Settings = lazy(() => import('./pages/team/Settings').then(m => ({ default: m.Settings })));
const ClientPortal = lazy(() => import('./pages/ClientPortal').then(m => ({ default: m.ClientPortal })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const ClientManagement = lazy(() => import('./pages/clients/ClientManagement').then(m => ({ default: m.ClientManagement })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Client Portal Pages
const ClientLogin = lazy(() => import('./pages/client/ClientLogin').then(m => ({ default: m.ClientLogin })));
const AcceptInvitation = lazy(() => import('./pages/client/AcceptInvitation').then(m => ({ default: m.AcceptInvitation })));
const ForgotPassword = lazy(() => import('./pages/client/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/client/ResetPassword').then(m => ({ default: m.ResetPassword })));

const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const ClientProjects = lazy(() => import('./pages/client/ClientProjects').then(m => ({ default: m.ClientProjects })));
const ClientProjectDetail = lazy(() => import('./pages/client/ClientProjectDetail').then(m => ({ default: m.ClientProjectDetail })));
const ClientReviews = lazy(() => import('./pages/client/ClientReviews').then(m => ({ default: m.ClientReviews })));
const ClientReviewDetail = lazy(() => import('./pages/client/ClientReviewDetail').then(m => ({ default: m.ClientReviewDetail })));
const ClientCalendar = lazy(() => import('./pages/client/ClientCalendar').then(m => ({ default: m.ClientCalendar })));
const ClientNotifications = lazy(() => import('./pages/client/ClientNotifications').then(m => ({ default: m.ClientNotifications })));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile').then(m => ({ default: m.ClientProfile })));
const ClientSettings = lazy(() => import('./pages/client/ClientSettings').then(m => ({ default: m.ClientSettings })));

const PlatformAdmin = lazy(() => import('./pages/admin/PlatformAdmin').then(m => ({ default: m.PlatformAdmin })));

import { ClientLayout } from './components/client/ClientLayout';
import { ClientProtectedRoute } from './components/client/ClientProtectedRoute';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ImpersonationBanner } from './components/admin/ImpersonationBanner';
import { FreePlanBanner } from './components/plan/FreePlanBanner';

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <ImpersonationBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy-policy" element={<LegalPage pageKey="privacy-policy" />} />
            <Route path="/terms" element={<LegalPage pageKey="terms" />} />
            <Route path="/cookies" element={<LegalPage pageKey="cookies" />} />
            <Route path="/data-deletion" element={<LegalPage pageKey="data-deletion" />} />
            <Route path="/acceptable-use" element={<LegalPage pageKey="acceptable-use" />} />
            <Route path="/security" element={<LegalPage pageKey="security" />} />
            <Route path="/compliance" element={<LegalPage pageKey="compliance" />} />
            <Route path="/status" element={<LegalPage pageKey="status" />} />
            <Route path="/docs" element={<LegalPage pageKey="docs" />} />
            <Route path="/api" element={<LegalPage pageKey="api" />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<AuthStatusPage type="forgot-password" />} />
          <Route path="/reset-password" element={<AuthStatusPage type="reset-password" />} />
          <Route path="/verify-email" element={<AuthStatusPage type="verify-email" />} />
          <Route path="/magic-link" element={<AuthStatusPage type="magic-link" />} />
          <Route path="/oauth/success" element={<AuthStatusPage type="oauth-success" />} />
          <Route path="/oauth/error" element={<AuthStatusPage type="oauth-error" />} />
          <Route path="/account-connected" element={<AuthStatusPage type="account-connected" />} />
          <Route path="/permission-missing" element={<AuthStatusPage type="permission-missing" />} />
          <Route path="/token-expired" element={<AuthStatusPage type="token-expired" />} />
          <Route path="/account-disconnected" element={<AuthStatusPage type="account-disconnected" />} />
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/401" element={<ErrorPage code={401} />} />
          <Route path="/403" element={<ErrorPage code={403} />} />
          <Route path="/404" element={<ErrorPage code={404} />} />
          <Route path="/429" element={<ErrorPage code={429} />} />
          <Route path="/500" element={<ErrorPage code={500} />} />
          <Route path="/503" element={<ErrorPage code={503} />} />

          {/* Client Auth & Public Routes */}
          <Route path="/client/login" element={<Suspense fallback={<PageLoader />}><ClientLogin /></Suspense>} />
          <Route path="/client/accept-invitation" element={<Suspense fallback={<PageLoader />}><AcceptInvitation /></Suspense>} />
          <Route path="/client/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
          <Route path="/client/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />

          {/* Client Protected Workspace Routes */}
          <Route path="/client" element={
            <ClientProtectedRoute>
              <ClientLayout />
            </ClientProtectedRoute>
          }>
            <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><ClientDashboard /></Suspense>} />
            <Route path="projects" element={<Suspense fallback={<PageLoader />}><ClientProjects /></Suspense>} />
            <Route path="projects/:id" element={<Suspense fallback={<PageLoader />}><ClientProjectDetail /></Suspense>} />
            <Route path="reviews" element={<Suspense fallback={<PageLoader />}><ClientReviews /></Suspense>} />
            <Route path="reviews/:postId" element={<Suspense fallback={<PageLoader />}><ClientReviewDetail /></Suspense>} />
            <Route path="approved" element={<Suspense fallback={<PageLoader />}><ClientReviews /></Suspense>} />
            <Route path="rejected" element={<Suspense fallback={<PageLoader />}><ClientReviews /></Suspense>} />
            <Route path="calendar" element={<Suspense fallback={<PageLoader />}><ClientCalendar /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageLoader />}><ClientNotifications /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<PageLoader />}><ClientProfile /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoader />}><ClientSettings /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Route>

          {/* Client Review Portal (Deprecated single page view) */}
          <Route path="/client/review" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ClientPortal />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Protected Dashboard App */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Suspense fallback={<SkeletonDashboard />}><Dashboard /></Suspense>} />
            <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
            <Route path="projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectOverview /></Suspense>} />
            <Route path="projects/:id/apps" element={<Suspense fallback={<PageLoader />}><ConnectedApps /></Suspense>} />
            <Route path="projects/:id/api" element={<Suspense fallback={<PageLoader />}><APIConnections /></Suspense>} />
            <Route path="calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />
            <Route path="studio" element={<Suspense fallback={<PageLoader />}><CreatePost /></Suspense>} />
            <Route path="workflow" element={<Suspense fallback={<PageLoader />}><Workflow /></Suspense>} />
            <Route path="workflow/:type/:id" element={<Suspense fallback={<PageLoader />}><WorkflowDetail /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
            <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaLibrary /></Suspense>} />
            <Route path="assets" element={<Suspense fallback={<PageLoader />}><MediaLibrary /></Suspense>} />
            <Route path="ai" element={<Suspense fallback={<PageLoader />}><AIAssistant /></Suspense>} />
            <Route path="ai/command-center" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="overview" /></Suspense>} />
            <Route path="ai/strategy" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="strategy" /></Suspense>} />
            <Route path="ai/content-planner" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="planner" /></Suspense>} />
            <Route path="ai/creative-studio" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="creative" /></Suspense>} />
            <Route path="ai/automation" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="automation" /></Suspense>} />
            <Route path="ai/automation/workflows" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="workflows" /></Suspense>} />
            <Route path="ai/approvals" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="approvals" /></Suspense>} />
            <Route path="ai/activity" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="activity" /></Suspense>} />
            <Route path="ai/business-memory" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="memory" /></Suspense>} />
            <Route path="ads" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="ads" /></Suspense>} />
            <Route path="ads/command-center" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="ads" /></Suspense>} />
            <Route path="ads/campaigns" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="ads" /></Suspense>} />
            <Route path="ads/audiences" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="ads" /></Suspense>} />
            <Route path="ads/analytics" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="ads" /></Suspense>} />
            <Route path="recommendations" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="overview" /></Suspense>} />
            <Route path="settings/ai" element={<Suspense fallback={<PageLoader />}><AIAssistant initialTab="settings" /></Suspense>} />
            <Route path="accounts" element={<Suspense fallback={<PageLoader />}><ConnectedApps /></Suspense>} />
            <Route path="connections" element={<Suspense fallback={<PageLoader />}><APIConnections /></Suspense>} />
            <Route path="team" element={<Suspense fallback={<PageLoader />}><Team /></Suspense>} />
            <Route path="billing" element={<Suspense fallback={<PageLoader />}><Billing /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
            <Route path="clients" element={<Suspense fallback={<PageLoader />}><ClientManagement /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
            <Route path="admin" element={<Suspense fallback={<PageLoader />}><PlatformAdmin /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ClientAuthProvider>
              <WorkspaceProvider>
                <SubscriptionProvider>
                  <ToastProvider>
                    <AnimatedRoutes />
                  </ToastProvider>
                </SubscriptionProvider>
              </WorkspaceProvider>
            </ClientAuthProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
