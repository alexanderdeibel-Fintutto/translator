// HomePage — City selection / discover page for the standalone City Guide app
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Loader2, Globe, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '../lib/supabase'

interface CityEntry {
  parent_name: string
  parent_id: string
  cover_image_url: string | null
  count: number
}

export default function HomePage() {
  const [cities, setCities] = useState<CityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    setLoading(true)

    // Get distinct cities from fw_content_items with domain='cityguide'
    const { data } = await supabase
      .from('fw_content_items')
      .select('parent_name, parent_id, cover_image_url')
      .eq('domain', 'cityguide')
      .eq('status', 'published')
      .order('parent_name')

    if (data) {
      // Group by parent_name to get unique cities with counts
      const cityMap = new Map<string, CityEntry>()
      for (const item of data) {
        const key = item.parent_name || ''
        if (!key) continue
        const existing = cityMap.get(key)
        if (existing) {
          existing.count++
        } else {
          cityMap.set(key, {
            parent_name: key,
            parent_id: item.parent_id,
            cover_image_url: item.cover_image_url,
            count: 1,
          })
        }
      }
      setCities(Array.from(cityMap.values()))
    }

    setLoading(false)
  }

  const filteredCities = search
    ? cities.filter(c => c.parent_name.toLowerCase().includes(search.toLowerCase()))
    : cities

  function citySlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">City Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Entdecke Staedte mit KI-Erzaehlungen, POI-Karten und mehrsprachigen Inhalten.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Stadt suchen..."
          className="pl-10"
        />
        {search && (
          <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearch('')}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* City list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Lade Staedte...</p>
        </div>
      ) : filteredCities.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {search ? 'Keine Staedte gefunden.' : 'Noch keine Staedte verfuegbar.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{filteredCities.length} {filteredCities.length === 1 ? 'Stadt' : 'Staedte'}</p>
          {filteredCities.map(city => (
            <Link key={city.parent_id || city.parent_name} to={`/city/${citySlug(city.parent_name)}`}>
              <Card className="p-3 flex gap-3 cursor-pointer hover:shadow-sm transition-shadow">
                {city.cover_image_url ? (
                  <img src={city.cover_image_url} alt={city.parent_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex items-center">
                  <div>
                    <h3 className="font-medium text-sm">{city.parent_name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {city.count} {city.count === 1 ? 'Ort' : 'Orte'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground self-center flex-shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
