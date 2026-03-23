// FavoritesPage — Shows saved favorite POIs across all cities
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, ChevronRight, Trash2 } from 'lucide-react'

interface FavoriteCity {
  slug: string
  ids: string[]
}

export default function FavoritesPage() {
  const [favCities, setFavCities] = useState<FavoriteCity[]>([])

  useEffect(() => {
    // Scan localStorage for fw_favorites_* keys
    const result: FavoriteCity[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('fw_favorites_')) {
        const slug = key.replace('fw_favorites_', '')
        try {
          const ids = JSON.parse(localStorage.getItem(key) || '[]')
          if (ids.length > 0) {
            result.push({ slug, ids })
          }
        } catch { /* */ }
      }
    }
    setFavCities(result)
  }, [])

  function clearFavorites(slug: string) {
    localStorage.removeItem(`fw_favorites_${slug}`)
    setFavCities(prev => prev.filter(c => c.slug !== slug))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Zurueck
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" /> Meine Favoriten
        </h1>
      </div>

      {favCities.length === 0 ? (
        <Card className="p-8 text-center">
          <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Favoriten gespeichert.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tippe auf das Herz-Symbol bei einem Ort, um ihn zu speichern.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {favCities.map(city => (
            <Card key={city.slug} className="p-4">
              <div className="flex items-center justify-between">
                <Link to={`/city/${city.slug}`} className="flex items-center gap-2 flex-1">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium text-sm capitalize">{city.slug.replace(/-/g, ' ')}</h3>
                    <p className="text-xs text-muted-foreground">{city.ids.length} {city.ids.length === 1 ? 'Favorit' : 'Favoriten'}</p>
                  </div>
                </Link>
                <div className="flex gap-1.5">
                  <Link to={`/city/${city.slug}`}>
                    <Button size="sm" variant="outline">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => clearFavorites(city.slug)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
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
