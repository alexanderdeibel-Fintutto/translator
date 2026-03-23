// Fintutto World — Venue / Floor / Room Editor
// Manage the spatial hierarchy of a museum: venues → floors → rooms

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2, Plus, Loader2, ChevronDown, ChevronRight, Trash2,
  Layers, DoorOpen, MapPin, Save, X,
} from 'lucide-react'
import {
  getVenues, getFloors, getRooms,
  createVenue, createFloor, createRoom,
} from '@/lib/artguide/museum-api'
import type { Venue, Floor, Room, VenueType } from '@/lib/artguide/types'
import { supabase } from '@/lib/supabase'

interface VenueWithChildren extends Venue {
  floors: FloorWithRooms[]
}

interface FloorWithRooms extends Floor {
  rooms: Room[]
}

export default function VenueEditor() {
  const [searchParams] = useSearchParams()
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [museumId, setMuseumId] = useState(searchParams.get('museum') || '')
  const [venues, setVenues] = useState<VenueWithChildren[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null)
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null)

  // Create forms
  const [showNewVenue, setShowNewVenue] = useState(false)
  const [showNewFloor, setShowNewFloor] = useState<string | null>(null) // venue ID
  const [showNewRoom, setShowNewRoom] = useState<string | null>(null) // venue ID
  const [saving, setSaving] = useState(false)

  // Form fields
  const [formName, setFormName] = useState('')
  const [formVenueType, setFormVenueType] = useState<VenueType>('indoor')
  const [formFloorNumber, setFormFloorNumber] = useState(0)
  const [formDescription, setFormDescription] = useState('')

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMuseums(data)
          if (!museumId && data.length === 1) setMuseumId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (museumId) loadHierarchy()
  }, [museumId])

  async function loadHierarchy() {
    setLoading(true)
    const venueList = await getVenues(museumId)

    const enriched: VenueWithChildren[] = await Promise.all(
      venueList.map(async (venue) => {
        const [floorList, roomList] = await Promise.all([
          getFloors(venue.id),
          getRooms(venue.id),
        ])

        const floorsWithRooms: FloorWithRooms[] = floorList.map(floor => ({
          ...floor,
          rooms: roomList.filter(r => r.floor_id === floor.id),
        }))

        // Rooms not assigned to any floor
        const unassignedRooms = roomList.filter(r => !r.floor_id)
        if (unassignedRooms.length > 0) {
          floorsWithRooms.push({
            id: `unassigned-${venue.id}`,
            venue_id: venue.id,
            name: { de: 'Nicht zugeordnet' },
            floor_number: -999,
            floorplan_url: null,
            floorplan_width: null,
            floorplan_height: null,
            sort_order: 999,
            is_active: true,
            rooms: unassignedRooms,
          } as FloorWithRooms)
        }

        return { ...venue, floors: floorsWithRooms }
      }),
    )

    setVenues(enriched)
    setLoading(false)
    if (enriched.length > 0 && !expandedVenue) setExpandedVenue(enriched[0].id)
  }

  function resetForm() {
    setFormName('')
    setFormVenueType('indoor')
    setFormFloorNumber(0)
    setFormDescription('')
  }

  async function handleCreateVenue() {
    if (!formName || !museumId) return
    setSaving(true)
    await createVenue({
      museum_id: museumId,
      name: { de: formName },
      description: formDescription ? { de: formDescription } : {},
      venue_type: formVenueType,
      sort_order: venues.length,
      is_active: true,
    })
    setShowNewVenue(false)
    resetForm()
    loadHierarchy()
    setSaving(false)
  }

  async function handleCreateFloor(venueId: string) {
    if (!formName) return
    setSaving(true)
    await createFloor({
      venue_id: venueId,
      name: { de: formName },
      floor_number: formFloorNumber,
      sort_order: formFloorNumber,
      is_active: true,
    })
    setShowNewFloor(null)
    resetForm()
    loadHierarchy()
    setSaving(false)
  }

  async function handleCreateRoom(venueId: string) {
    if (!formName) return
    setSaving(true)
    const venue = venues.find(v => v.id === venueId)
    const targetFloor = expandedFloor && !expandedFloor.startsWith('unassigned-')
      ? expandedFloor
      : null

    await createRoom({
      venue_id: venueId,
      floor_id: targetFloor,
      name: { de: formName },
      description: formDescription ? { de: formDescription } : {},
      sort_order: 0,
      is_active: true,
    })
    setShowNewRoom(null)
    resetForm()
    loadHierarchy()
    setSaving(false)
  }

  async function handleDeleteVenue(id: string) {
    if (!confirm('Gebaeude und alle Etagen/Raeume wirklich loeschen?')) return
    await supabase.from('ag_venues').update({ is_active: false }).eq('id', id)
    loadHierarchy()
  }

  async function handleDeleteFloor(id: string) {
    if (id.startsWith('unassigned-')) return
    await supabase.from('ag_floors').update({ is_active: false }).eq('id', id)
    loadHierarchy()
  }

  async function handleDeleteRoom(id: string) {
    await supabase.from('ag_rooms').update({ is_active: false }).eq('id', id)
    loadHierarchy()
  }

  const totalRooms = venues.reduce((s, v) => s + v.floors.reduce((s2, f) => s2 + f.rooms.length, 0), 0)
  const totalFloors = venues.reduce((s, v) => s + v.floors.filter(f => !f.id.startsWith('unassigned-')).length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Raeume & Gebaeude
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {venues.length} Gebaeude, {totalFloors} Etagen, {totalRooms} Raeume
          </p>
        </div>
        <Button onClick={() => { setShowNewVenue(true); resetForm() }} disabled={!museumId}>
          <Plus className="h-4 w-4 mr-2" /> Neues Gebaeude
        </Button>
      </div>

      {/* Museum selector */}
      {museums.length > 1 && (
        <Select value={museumId} onValueChange={setMuseumId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Museum auswaehlen..." />
          </SelectTrigger>
          <SelectContent>
            {museums.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* New venue form */}
      {showNewVenue && (
        <Card className="p-4 space-y-3 border-primary">
          <h3 className="font-semibold text-sm">Neues Gebaeude</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="z.B. Hauptgebaeude" />
            </div>
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <Select value={formVenueType} onValueChange={v => setFormVenueType(v as VenueType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Innen</SelectItem>
                  <SelectItem value="outdoor">Aussen</SelectItem>
                  <SelectItem value="mixed">Gemischt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Beschreibung</Label>
              <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowNewVenue(false); resetForm() }}>
              <X className="h-3.5 w-3.5 mr-1" /> Abbrechen
            </Button>
            <Button size="sm" onClick={handleCreateVenue} disabled={saving || !formName}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Erstellen
            </Button>
          </div>
        </Card>
      )}

      {/* Venue tree */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Keine Gebaeude</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle ein Gebaeude, um Etagen und Raeume anzulegen.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {venues.map(venue => {
            const isOpen = expandedVenue === venue.id
            const venueNameDe = (venue.name as Record<string, string>)?.de || venue.id

            return (
              <Card key={venue.id} className="overflow-hidden">
                {/* Venue header */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setExpandedVenue(isOpen ? null : venue.id)}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Building2 className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{venueNameDe}</h3>
                    <p className="text-xs text-muted-foreground">
                      {venue.venue_type} · {venue.floors.filter(f => !f.id.startsWith('unassigned-')).length} Etagen · {venue.floors.reduce((s, f) => s + f.rooms.length, 0)} Raeume
                    </p>
                  </div>
                  <Badge variant="outline">{venue.venue_type}</Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={e => { e.stopPropagation(); handleDeleteVenue(venue.id) }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Floors & rooms */}
                {isOpen && (
                  <div className="border-t bg-muted/20">
                    {/* Action bar */}
                    <div className="flex gap-2 p-3 border-b">
                      <Button size="sm" variant="outline" onClick={() => { setShowNewFloor(venue.id); resetForm() }}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Etage
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowNewRoom(venue.id); resetForm() }}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Raum
                      </Button>
                    </div>

                    {/* New floor form */}
                    {showNewFloor === venue.id && (
                      <div className="p-3 border-b bg-muted/40 flex items-end gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Etage Name</Label>
                          <Input size={20} value={formName} onChange={e => setFormName(e.target.value)} placeholder="z.B. Erdgeschoss" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nr.</Label>
                          <Input type="number" value={formFloorNumber} onChange={e => setFormFloorNumber(Number(e.target.value))} className="h-8 text-sm w-20" />
                        </div>
                        <Button size="sm" onClick={() => handleCreateFloor(venue.id)} disabled={saving || !formName}>
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowNewFloor(null); resetForm() }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* New room form */}
                    {showNewRoom === venue.id && (
                      <div className="p-3 border-b bg-muted/40 flex items-end gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Raum Name</Label>
                          <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="z.B. Saal A" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Beschreibung</Label>
                          <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Optional" className="h-8 text-sm" />
                        </div>
                        <Button size="sm" onClick={() => handleCreateRoom(venue.id)} disabled={saving || !formName}>
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowNewRoom(null); resetForm() }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* Floor list */}
                    {venue.floors.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Noch keine Etagen oder Raeume angelegt.
                      </div>
                    ) : (
                      venue.floors.map(floor => {
                        const floorNameDe = (floor.name as Record<string, string>)?.de || `Etage ${floor.floor_number}`
                        const isFloorOpen = expandedFloor === floor.id

                        return (
                          <div key={floor.id} className="border-b last:border-0">
                            <div
                              className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-accent/30 transition-colors"
                              onClick={() => setExpandedFloor(isFloorOpen ? null : floor.id)}
                            >
                              <div className="w-6" />
                              {isFloorOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium flex-1">{floorNameDe}</span>
                              <span className="text-xs text-muted-foreground">{floor.rooms.length} Raeume</span>
                              {!floor.id.startsWith('unassigned-') && (
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); handleDeleteFloor(floor.id) }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {isFloorOpen && floor.rooms.length > 0 && (
                              <div className="pl-16 pr-4 pb-2 space-y-1">
                                {floor.rooms.map(room => {
                                  const roomNameDe = (room.name as Record<string, string>)?.de || room.id
                                  return (
                                    <div key={room.id} className="flex items-center gap-2 text-sm py-1">
                                      <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="flex-1">{roomNameDe}</span>
                                      {room.floorplan_x != null && room.floorplan_y != null && (
                                        <Badge variant="outline" className="text-[10px]">
                                          <MapPin className="h-2.5 w-2.5 mr-0.5" /> Platziert
                                        </Badge>
                                      )}
                                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDeleteRoom(room.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
