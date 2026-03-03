import { Routes, Route } from 'react-router-dom'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminLayout from '@/components/admin/AdminLayout'
import PipelineBoard from '@/components/admin/PipelineBoard'
import LeadList from '@/components/admin/LeadList'
import LeadDetail from '@/components/admin/LeadDetail'
import AdminStats from '@/components/admin/AdminStats'
import ContactRequestList from '@/components/admin/ContactRequestList'

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          <Route index element={<PipelineBoard />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="requests" element={<ContactRequestList />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  )
}
