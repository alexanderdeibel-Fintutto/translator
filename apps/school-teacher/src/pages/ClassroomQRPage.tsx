/**
 * Classroom QR Page
 *
 * Lets teachers create and manage a persistent QR code for their classroom.
 * The code is saved in localStorage so it survives page reloads.
 * Teachers can print or download the poster.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateSessionCode } from '@/lib/session'
import ClassroomQRPoster from '@/components/market/ClassroomQRPoster'

const STORAGE_KEY = 'school-translator-classroom'

interface ClassroomConfig {
  code: string
  name: string
  createdAt: string
}

export default function ClassroomQRPage() {
  const navigate = useNavigate()
  const [classroom, setClassroom] = useState<ClassroomConfig | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [saved, setSaved] = useState(false)

  // Load saved classroom on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const config = JSON.parse(stored) as ClassroomConfig
        setClassroom(config)
        setNameInput(config.name)
      } catch {
        // ignore corrupt data
      }
    }
  }, [])

  const handleCreate = () => {
    const config: ClassroomConfig = {
      code: generateSessionCode(),
      name: nameInput.trim() || 'Mein Klassenzimmer',
      createdAt: new Date().toISOString(),
    }
    setClassroom(config)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNewCode = () => {
    if (!classroom) return
    const updated = {
      ...classroom,
      code: generateSessionCode(),
    }
    setClassroom(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleSaveName = () => {
    if (!classroom) return
    const updated = {
      ...classroom,
      name: nameInput.trim() || classroom.name,
    }
    setClassroom(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Klassenzimmer-QR</h1>
          <p className="text-sm text-muted-foreground">
            Permanenter QR-Code fuer Ihr Klassenzimmer
          </p>
        </div>
      </div>

      {!classroom ? (
        /* Setup form */
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Klassenname (optional)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="z.B. Klasse 3b, Raum 204"
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
            />
          </div>
          <Button
            onClick={handleCreate}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            QR-Code erstellen
          </Button>
          <p className="text-xs text-muted-foreground">
            Der Code bleibt gespeichert und kann ausgedruckt und an die Wand gehaengt werden.
            Schueler scannen ihn mit ihrem Handy, um der Uebersetzung beizutreten.
          </p>
        </Card>
      ) : (
        /* Poster + management */
        <>
          {/* Name edit */}
          <Card className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Klassenname"
                className="flex-1 px-3 py-2 border rounded-lg bg-background text-foreground text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveName}
                className="gap-1"
              >
                <Save className="h-3 w-3" />
                {saved ? 'Gespeichert!' : 'Speichern'}
              </Button>
            </div>
          </Card>

          {/* QR Poster */}
          <ClassroomQRPoster
            code={classroom.code}
            classroomName={classroom.name}
          />

          {/* New code button */}
          <Button
            variant="outline"
            onClick={handleNewCode}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Neuen Code generieren
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Erstellt am {new Date(classroom.createdAt).toLocaleDateString('de-DE')}
            {' — '}
            Der QR-Code verweist auf die Schueler-App. Haengen Sie ihn im Klassenzimmer auf.
          </p>
        </>
      )}
    </div>
  )
}
