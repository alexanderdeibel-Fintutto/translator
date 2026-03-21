import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminLayout from '@/components/admin/AdminLayout'
import PipelineBoard from '@/components/admin/PipelineBoard'
import LeadList from '@/components/admin/LeadList'
import LeadDetail from '@/components/admin/LeadDetail'
import AdminStats from '@/components/admin/AdminStats'
import ContactRequestList from '@/components/admin/ContactRequestList'
import SessionList from '@/components/admin/SessionList'
import SessionDetail from '@/components/admin/SessionDetail'
import SessionStatsView from '@/components/admin/SessionStats'
import UserManager from '@/components/admin/UserManager'
import UserActivityView from '@/components/admin/UserActivity'
import SalesPerformanceView from '@/components/admin/SalesPerformance'

// Lazy-loaded Fintutto World pages
const MuseumListPage = lazy(() => import('@/components/admin/MuseumList'))
const MuseumOnboardingPage = lazy(() => import('@/components/admin/MuseumOnboarding'))
const ArtworkManagerPage = lazy(() => import('@/components/admin/ArtworkManager'))
const VenueEditorPage = lazy(() => import('@/components/admin/VenueEditor'))
const StaffManagerPage = lazy(() => import('@/components/admin/StaffManager'))
const ContentImportPage = lazy(() => import('@/components/admin/ContentImport'))
const ContentManagerPage = lazy(() => import('@/components/admin/ContentManager'))
const AiContentPanelPage = lazy(() => import('@/components/admin/AiContentPanel'))
const TourEditorPage = lazy(() => import('@/components/admin/TourEditor'))
const QrCodeManagerPage = lazy(() => import('@/components/admin/QrCodeManager'))
const MuseumAnalyticsPage = lazy(() => import('@/components/admin/MuseumAnalytics'))
const CrmDashboardPage = lazy(() => import('@/components/admin/CrmDashboard'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          {/* CRM Routes */}
          <Route index element={<PipelineBoard />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="requests" element={<ContactRequestList />} />
          <Route path="sales" element={<SalesPerformanceView />} />

          {/* Museum & Guide Routes */}
          <Route path="museums" element={<Suspense fallback={<PageLoader />}><MuseumListPage /></Suspense>} />
          <Route path="museum-onboarding" element={<Suspense fallback={<PageLoader />}><MuseumOnboardingPage /></Suspense>} />
          <Route path="artworks" element={<Suspense fallback={<PageLoader />}><ArtworkManagerPage /></Suspense>} />
          <Route path="venues" element={<Suspense fallback={<PageLoader />}><VenueEditorPage /></Suspense>} />
          <Route path="staff" element={<Suspense fallback={<PageLoader />}><StaffManagerPage /></Suspense>} />
          <Route path="content-import" element={<Suspense fallback={<PageLoader />}><ContentImportPage /></Suspense>} />
          <Route path="content" element={<Suspense fallback={<PageLoader />}><ContentManagerPage /></Suspense>} />
          <Route path="ai-content" element={<Suspense fallback={<PageLoader />}><AiContentPanelPage /></Suspense>} />
          <Route path="tours" element={<Suspense fallback={<PageLoader />}><TourEditorPage /></Suspense>} />
          <Route path="qr-codes" element={<Suspense fallback={<PageLoader />}><QrCodeManagerPage /></Suspense>} />
          <Route path="museum-analytics" element={<Suspense fallback={<PageLoader />}><MuseumAnalyticsPage /></Suspense>} />
          <Route path="crm" element={<Suspense fallback={<PageLoader />}><CrmDashboardPage /></Suspense>} />

          {/* Session Management Routes */}
          <Route path="sessions" element={<SessionList />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="session-stats" element={<SessionStatsView />} />
          <Route path="users" element={<UserManager />} />
          <Route path="user-activity" element={<UserActivityView />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  )
}
