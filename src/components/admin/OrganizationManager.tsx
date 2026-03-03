import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Building, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface OrgSummary {
  id: string
  name: string
  tier_id: string
  max_seats: number
  created_at: string
  member_count: number
}

export default function OrganizationManager() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: orgData } = await supabase
        .from('gt_organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (!orgData) { setLoading(false); return }

      const summaries: OrgSummary[] = await Promise.all(
        orgData.map(async (org) => {
          const { count } = await supabase
            .from('gt_users')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
          return {
            id: org.id,
            name: org.name,
            tier_id: org.tier_id,
            max_seats: org.max_seats,
            created_at: org.created_at,
            member_count: count ?? 0,
          }
        })
      )
      setOrgs(summaries)
      setLoading(false)
    }
    load().catch(console.error)
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Organisationen...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Organisationen</h2>
      </div>
      {orgs.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          Keine Organisationen vorhanden
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Mitglieder</TableHead>
              <TableHead>Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map(org => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{org.tier_id}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{org.member_count} / {org.max_seats}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(org.created_at).toLocaleDateString('de-DE')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
