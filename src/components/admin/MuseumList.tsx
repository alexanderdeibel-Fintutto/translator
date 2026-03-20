// Fintutto World — Museum Management List
// Shows all museums with onboarding status, invite links, and quick actions

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Landmark, Plus, Search, ExternalLink, Copy, Check, Users,
  Globe, MapPin, QrCode, BarChart3, Image, Route, Paintbrush,
  Building2, FileText, Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Museum } from '@/lib/artguide/types'

interface MuseumWithStats extends Museum {
  artwork_count: number
  tour_count: number
  staff_count: number
  published_count: number
  draft_count: number
}

export default function MuseumList() {
  const navigate = useNavigate()
  const [museums, setMuseums] = useState<MuseumWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadMuseums()
  }, [])

  async function loadMuseums() {
    setLoading(true)

    const { data: museumData } = await supabase
      .from('ag_museums')
      .select('*')
      .order('created_at', { ascending: false })

    if (!museumData) { setLoading(false); return }

    // Fetch counts for each museum in parallel
    const enriched = await Promise.all(
      (museumData as Museum[]).map(async (museum) => {
        const [artworks, tours, staff] = await Promise.all([
          supabase.from('ag_artworks').select('id, status', { count: 'exact', head: false }).eq('museum_id', museum.id),
          supabase.from('ag_tours').select('id', { count: 'exact', head: true }).eq('museum_id', museum.id),
          supabase.from('ag_museum_users').select('id', { count: 'exact', head: true }).eq('museum_id', museum.id).eq('is_active', true),
        ])

        const artworkList = (artworks.data || []) as { id: string; status: string }[]

        return {
          ...museum,
          artwork_count: artworkList.length,
          published_count: artworkList.filter(a => a.status === 'published').length,
          draft_count: artworkList.filter(a => a.status === 'draft').length,
          tour_count: tours.count ?? 0,
          staff_count: staff.count ?? 0,
        } as MuseumWithStats
      }),
    )

    setMuseums(enriched)
    setLoading(false)
  }

  async function copyInviteLink(museum: MuseumWithStats) {
    const url = `${window.location.origin}/museum/${museum.slug}`
    await navigator.clipboard.writeText(url)
    setCopiedId(museum.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = museums.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.slug.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            Museen verwalten
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {museums.length} Museum{museums.length !== 1 ? 'en' : ''} im System
          </p>
        </div>
        <Button onClick={() => navigate('/admin/museum-onboarding')}>
          <Plus className="h-4 w-4 mr-2" />
          Museum einladen
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Museum suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Lade Museen...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {search ? 'Keine Museen gefunden' : 'Noch keine Museen'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? 'Versuche einen anderen Suchbegriff.'
              : 'Lade das erste Museum ein, um loszulegen.'}
          </p>
          {!search && (
            <Button onClick={() => navigate('/admin/museum-onboarding')}>
              <Plus className="h-4 w-4 mr-2" />
              Erstes Museum einladen
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(museum => (
            <Card key={museum.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{museum.name}</h3>
                    <Badge variant={museum.is_active ? 'default' : 'secondary'}>
                      {museum.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Badge variant="outline">{museum.tier_id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    /{museum.slug}
                    {museum.address?.city && ` — ${museum.address.city}`}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      {museum.artwork_count} Exponate
                      {museum.published_count > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-0.5">
                          {museum.published_count} live
                        </Badge>
                      )}
                      {museum.draft_count > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                          {museum.draft_count} Entwurf
                        </Badge>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Route className="h-3 w-3" />
                      {museum.tour_count} Fuehrungen
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {museum.staff_count} Mitarbeiter
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {museum.supported_languages?.length ?? 0} Sprachen
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 ml-4">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/artworks?museum=${museum.id}`)} title="Exponate">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/venues?museum=${museum.id}`)} title="Raeume">
                    <Building2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/tours?museum=${museum.id}`)} title="Fuehrungen">
                    <Route className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/staff?museum=${museum.id}`)} title="Team">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/qr-codes?museum=${museum.id}`)} title="QR-Codes">
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/museum-analytics?museum=${museum.id}`)} title="Analysen">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyInviteLink(museum)} title="Link kopieren">
                    {copiedId === museum.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`/museum/${museum.slug}`, '_blank')} title="Vorschau">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
