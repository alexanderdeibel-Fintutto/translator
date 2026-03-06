import { Routes, Route } from 'react-router-dom'
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

          {/* Session Management Routes */}
          <Route path="sessions" element={<SessionList />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="session-stats" element={<SessionStatsView />} />
          <Route path="users" element={<UserManager />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  )
}
