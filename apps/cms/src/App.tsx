/**
 * CMS App — cms.fintutto.world
 *
 * Zentrales Content Management System für alle Fintutto-Anbieter.
 *
 * Rollen & Zugang:
 * - Super-Admin (Fintutto intern): Alle Institutionen, alle Inhalte
 * - City/Region-Admin: Alle Institutionen in ihrer Stadt/Region
 * - Institution-Admin: Eigene Institution (Museum, POI, Restaurant...)
 * - Redakteur: Inhalte erstellen/bearbeiten (keine Freigabe)
 * - Freigabe-Redakteur: Inhalte freigeben/ablehnen
 * - Viewer: Nur lesen
 *
 * Routing:
 * /                    → CmsLoginPage (Einstieg)
 * /dashboard           → CmsDashboardPage (Übersicht nach Login)
 * /institutions        → InstitutionsListPage (City/Region-Admins)
 * /:slug               → InstitutionDashboardPage (Institution-spezifisch)
 * /:slug/content       → ContentListPage (Exponate, POIs, Artikel)
 * /:slug/content/:id   → ContentEditorPage (Inhalt bearbeiten)
 * /:slug/team          → TeamManagementPage (Rollen & Benutzer)
 * /:slug/analytics     → AnalyticsPage (Aufrufe, Besucher)
 * /:slug/billing       → BillingPage (Abrechnung, Tier)
 * /:slug/settings      → SettingsPage (Institution-Einstellungen)
 *
 * Unterschied zu AMS (ams.fintutto.world):
 * - AMS = Account-Verwaltung, Leads, Billing, Sessions, Nutzer (Fintutto-intern)
 * - CMS = Content-Verwaltung, Redaktion, Freigabe-Workflows (Anbieter-seitig)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'
import { UserProvider } from '@/context/UserContext'
import { I18nProvider } from '@/context/I18nContext'
import ErrorBoundary from '@/components/ErrorBoundary'

// Auth & Layout
const CmsLoginPage         = lazy(() => import('./pages/CmsLoginPage'))
const CmsDashboardPage     = lazy(() => import('./pages/CmsDashboardPage'))

// Content Management (aus artguide-portal übernommen / erweitert)
const ArtworkManager       = lazy(() => import('@/components/admin/ArtworkManager'))
const ContentManager       = lazy(() => import('@/components/admin/ContentManager'))
const ContentValidation    = lazy(() => import('@/components/admin/ContentValidation'))
const ContentImport        = lazy(() => import('@/components/admin/ContentImport'))
const SortableContentList  = lazy(() => import('@/components/admin/SortableContentList'))
const InlineEditList       = lazy(() => import('@/components/admin/InlineEditList'))
const VisitorPreview       = lazy(() => import('@/components/admin/VisitorPreview'))
const AiContentPanel       = lazy(() => import('@/components/admin/AiContentPanel'))
const WorkflowManager      = lazy(() => import('@/components/admin/WorkflowManager'))
const QrCodeManager        = lazy(() => import('@/components/admin/QrCodeManager'))
const MuseumAnalytics      = lazy(() => import('@/components/admin/MuseumAnalytics'))
const VenueEditor          = lazy(() => import('@/components/admin/VenueEditor'))
const TourEditor           = lazy(() => import('@/components/admin/TourEditor'))
const StaffManager         = lazy(() => import('@/components/admin/StaffManager'))
const MuseumList           = lazy(() => import('@/components/admin/MuseumList'))
const MuseumOnboarding     = lazy(() => import('@/components/admin/MuseumOnboarding'))
const CuratorDashboard     = lazy(() => import('@/components/admin/CuratorDashboard'))
const TeamPhrasesAdminPage = lazy(() => import('./pages/TeamPhrasesAdminPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
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
              {/* Login — zentraler Einstieg */}
              <Route path="/login" element={<S><CmsLoginPage /></S>} />

              {/* Dashboard — Übersicht nach Login */}
              <Route path="/dashboard" element={<S><CmsDashboardPage /></S>} />

              {/* Institutionen-Übersicht (für City/Region-Admins und Super-Admins) */}
              <Route path="/institutions" element={<S><MuseumList /></S>} />
              <Route path="/institutions/new" element={<S><MuseumOnboarding /></S>} />

              {/* Institution-spezifische Routen — /:slug/... */}
              <Route path="/:slug" element={<S><CuratorDashboard /></S>} />
              <Route path="/:slug/content" element={<S><ContentManager /></S>} />
              <Route path="/:slug/content/import" element={<S><ContentImport /></S>} />
              <Route path="/:slug/content/sort" element={<S><SortableContentList /></S>} />
              <Route path="/:slug/content/edit" element={<S><InlineEditList /></S>} />
              <Route path="/:slug/content/validation" element={<S><ContentValidation /></S>} />
              <Route path="/:slug/content/preview" element={<S><VisitorPreview /></S>} />
              <Route path="/:slug/artworks" element={<S><ArtworkManager /></S>} />
              <Route path="/:slug/ai" element={<S><AiContentPanel /></S>} />
              <Route path="/:slug/workflow" element={<S><WorkflowManager /></S>} />
              <Route path="/:slug/qr" element={<S><QrCodeManager /></S>} />
              <Route path="/:slug/analytics" element={<S><MuseumAnalytics /></S>} />
              <Route path="/:slug/venues" element={<S><VenueEditor /></S>} />
              <Route path="/:slug/tours" element={<S><TourEditor /></S>} />
              <Route path="/:slug/team" element={<S><StaffManager /></S>} />
              <Route path="/:slug/team-phrases" element={<S><TeamPhrasesAdminPage /></S>} />
              <Route path="/team-phrases" element={<S><TeamPhrasesAdminPage /></S>} />

              {/* Redirect root → login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch-all → login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </UserProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
