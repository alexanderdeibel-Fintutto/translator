/**
 * AMS — Account Management System (ams.fintutto.world)
 *
 * Global account management for all Fintutto products.
 * Extracted from consumer app's /admin and /crm-login routes.
 *
 * Sections:
 *   CRM & Sales:       Pipeline, Leads, Stats, Requests, Revenue, Email Templates, Invites, Orgs
 *   Museum & Guide:    Museums, Onboarding, Artworks, Venues, Tours, Content, QR, Analytics, Workflow
 *   Translator/System: Sessions, Session Stats, Users, User Activity
 *
 * Roles: super_admin, admin, sales_agent, session_manager, tester
 * Target: ams.fintutto.world
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'
import { UserProvider } from '@/context/UserContext'
import { I18nProvider } from '@/context/I18nContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminLayout from '@/components/admin/AdminLayout'

// CRM & Sales
const PipelineBoard       = lazy(() => import('@/components/admin/PipelineBoard'))
const LeadList            = lazy(() => import('@/components/admin/LeadList'))
const AdminStats          = lazy(() => import('@/components/admin/AdminStats'))
const ContactRequestList  = lazy(() => import('@/components/admin/ContactRequestList'))
const SalesPerformance    = lazy(() => import('@/components/admin/SalesPerformance'))
const RevenueDashboard    = lazy(() => import('@/components/admin/RevenueDashboard'))
const EmailTemplateEditor = lazy(() => import('@/components/admin/EmailTemplateEditor'))
const InviteGenerator     = lazy(() => import('@/components/admin/InviteGenerator'))
const OrganizationManager = lazy(() => import('@/components/admin/OrganizationManager'))

// Museum & Guide
const CuratorDashboard    = lazy(() => import('@/components/admin/CuratorDashboard'))
const MuseumList          = lazy(() => import('@/components/admin/MuseumList'))
const MuseumOnboarding    = lazy(() => import('@/components/admin/MuseumOnboarding'))
const ArtworkManager      = lazy(() => import('@/components/admin/ArtworkManager'))
const VenueEditor         = lazy(() => import('@/components/admin/VenueEditor'))
const TourEditor          = lazy(() => import('@/components/admin/TourEditor'))
const StaffManager        = lazy(() => import('@/components/admin/StaffManager'))
const ContentImport       = lazy(() => import('@/components/admin/ContentImport'))
const ContentManager      = lazy(() => import('@/components/admin/ContentManager'))
const SortableContentList = lazy(() => import('@/components/admin/SortableContentList'))
const InlineEditList      = lazy(() => import('@/components/admin/InlineEditList'))
const ContentValidation   = lazy(() => import('@/components/admin/ContentValidation'))
const VisitorPreview      = lazy(() => import('@/components/admin/VisitorPreview'))
const AiContentPanel      = lazy(() => import('@/components/admin/AiContentPanel'))
const QrCodeManager       = lazy(() => import('@/components/admin/QrCodeManager'))
const MuseumAnalytics     = lazy(() => import('@/components/admin/MuseumAnalytics'))
const WorkflowManager     = lazy(() => import('@/components/admin/WorkflowManager'))
const CrmDashboard        = lazy(() => import('@/components/admin/CrmDashboard'))

// Translator & System
const SessionList         = lazy(() => import('@/components/admin/SessionList'))
const SessionDetail       = lazy(() => import('@/components/admin/SessionDetail'))
const SessionStats        = lazy(() => import('@/components/admin/SessionStats'))
const UserManager         = lazy(() => import('@/components/admin/UserManager'))
const UserActivity        = lazy(() => import('@/components/admin/UserActivity'))

// Login
const AmsLoginPage        = lazy(() => import('./pages/AmsLoginPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              {/* Login */}
              <Route path="/login" element={<S><AmsLoginPage /></S>} />

              {/* AMS — protected by AdminGuard */}
              <Route
                path="/*"
                element={
                  <AdminGuard>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<S><PipelineBoard /></S>} />

                        {/* CRM & Sales */}
                        <Route path="leads"            element={<S><LeadList /></S>} />
                        <Route path="stats"            element={<S><AdminStats /></S>} />
                        <Route path="requests"         element={<S><ContactRequestList /></S>} />
                        <Route path="sales"            element={<S><SalesPerformance /></S>} />
                        <Route path="revenue"          element={<S><RevenueDashboard /></S>} />
                        <Route path="email-templates"  element={<S><EmailTemplateEditor /></S>} />
                        <Route path="invites"          element={<S><InviteGenerator /></S>} />
                        <Route path="organizations"    element={<S><OrganizationManager /></S>} />

                        {/* Museum & Guide */}
                        <Route path="dashboard"         element={<S><CuratorDashboard /></S>} />
                        <Route path="museums"           element={<S><MuseumList /></S>} />
                        <Route path="museum-onboarding" element={<S><MuseumOnboarding /></S>} />
                        <Route path="artworks"          element={<S><ArtworkManager /></S>} />
                        <Route path="venues"            element={<S><VenueEditor /></S>} />
                        <Route path="tours"             element={<S><TourEditor /></S>} />
                        <Route path="staff"             element={<S><StaffManager /></S>} />
                        <Route path="content-import"    element={<S><ContentImport /></S>} />
                        <Route path="content"           element={<S><ContentManager /></S>} />
                        <Route path="content-sort"      element={<S><SortableContentList /></S>} />
                        <Route path="content-edit"      element={<S><InlineEditList /></S>} />
                        <Route path="content-validation" element={<S><ContentValidation /></S>} />
                        <Route path="content-preview"   element={<S><VisitorPreview /></S>} />
                        <Route path="ai-content"        element={<S><AiContentPanel /></S>} />
                        <Route path="qr-codes"          element={<S><QrCodeManager /></S>} />
                        <Route path="museum-analytics"  element={<S><MuseumAnalytics /></S>} />
                        <Route path="workflow"          element={<S><WorkflowManager /></S>} />
                        <Route path="crm"               element={<S><CrmDashboard /></S>} />

                        {/* Translator & System */}
                        <Route path="sessions"          element={<S><SessionList /></S>} />
                        <Route path="sessions/:id"      element={<S><SessionDetail /></S>} />
                        <Route path="session-stats"     element={<S><SessionStats /></S>} />
                        <Route path="users"             element={<S><UserManager /></S>} />
                        <Route path="user-activity"     element={<S><UserActivity /></S>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminGuard>
                }
              />
            </Routes>
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </UserProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
