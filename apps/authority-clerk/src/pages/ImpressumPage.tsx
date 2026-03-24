/**
 * Impressum & Datenschutz — AmtTranslator
 * Pflichtangaben nach § 5 TMG und DSGVO Art. 13/14
 */

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Building2, Mail, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ImpressumPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      </div>

      {/* Impressum */}
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Impressum</h1>
          <p className="text-muted-foreground text-sm mt-1">Angaben gemäß § 5 TMG</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-teal-600" />
            Anbieter
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">Fintutto GmbH</p>
            <p className="text-muted-foreground">Betreiber von GuideTranslator / AmtTranslator</p>
            <div className="mt-3 space-y-1">
              <p>[Straße und Hausnummer]</p>
              <p>[PLZ] [Stadt]</p>
              <p>Deutschland</p>
            </div>
          </div>
          <div className="text-sm space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href="mailto:info@guidetranslator.de" className="text-teal-700 hover:underline">
                info@guidetranslator.de
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href="https://www.guidetranslator.de" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                www.guidetranslator.de
              </a>
            </div>
          </div>
          <div className="text-sm space-y-1 pt-2 border-t">
            <p><span className="font-medium">Handelsregister:</span> [Amtsgericht] HRB [Nummer]</p>
            <p><span className="font-medium">USt-IdNr.:</span> DE[Nummer]</p>
            <p><span className="font-medium">Geschäftsführer:</span> Alexander Deibel</p>
          </div>
        </Card>
      </section>

      {/* Datenschutz */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Datenschutzerklärung</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gemäß DSGVO Art. 13/14 und BDSG
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5 text-teal-600" />
            Grundsatz: Offline-First, keine Datenspeicherung
          </div>
          <p className="text-sm text-muted-foreground">
            AmtTranslator ist als Offline-Anwendung konzipiert. Gesprächsinhalte werden 
            <strong> ausschließlich auf dem Gerät verarbeitet</strong> und nicht an externe Server 
            übertragen. Es werden keine Gesprächsdaten gespeichert oder protokolliert.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">1. Verarbeitete Daten</h3>
          <div className="text-sm space-y-3">
            <div>
              <p className="font-medium">a) Sprachdaten (Mikrofon)</p>
              <p className="text-muted-foreground">
                Sprachaufnahmen werden lokal auf dem Gerät verarbeitet (Web Speech API / 
                On-Device-Modell). Bei Online-Betrieb können Sprachdaten zur Verarbeitung 
                an die Google Speech-to-Text API übertragen werden. Grundlage: Art. 6 Abs. 1 lit. b DSGVO 
                (Vertragserfüllung) oder Art. 6 Abs. 1 lit. e DSGVO (öffentliche Aufgabe).
              </p>
            </div>
            <div>
              <p className="font-medium">b) Übersetzungsdaten</p>
              <p className="text-muted-foreground">
                Bei Online-Betrieb werden Texte zur Übersetzung an die Google Translate API 
                oder OpenAI API übertragen. Im Offline-Modus erfolgt die Übersetzung lokal.
                Keine dauerhafte Speicherung durch den Anbieter.
              </p>
            </div>
            <div>
              <p className="font-medium">c) Nutzungsdaten (optional)</p>
              <p className="text-muted-foreground">
                Anonymisierte Nutzungsstatistiken (Sitzungsanzahl, Sprachpaarungen) können 
                zur Verbesserung des Dienstes erhoben werden. Keine personenbezogenen Daten.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">2. Auftragsverarbeitung (AVV)</h3>
          <p className="text-sm text-muted-foreground">
            Für den Online-Betrieb bestehen Auftragsverarbeitungsverträge (AVV) mit:
          </p>
          <ul className="text-sm space-y-2">
            {[
              { name: 'Google LLC', service: 'Speech-to-Text, Translate API', location: 'USA (EU-Standardvertragsklauseln)' },
              { name: 'OpenAI Inc.', service: 'GPT-4 API (optional)', location: 'USA (EU-Standardvertragsklauseln)' },
              { name: 'Supabase Inc.', service: 'Authentifizierung (optional)', location: 'USA (EU-Standardvertragsklauseln)' },
            ].map((avv, i) => (
              <li key={i} className="border rounded-lg p-3">
                <p className="font-medium">{avv.name}</p>
                <p className="text-muted-foreground">{avv.service}</p>
                <p className="text-xs text-muted-foreground">{avv.location}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">3. Betroffenenrechte</h3>
          <p className="text-sm text-muted-foreground">
            Sie haben gemäß DSGVO folgende Rechte:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Auskunft über verarbeitete Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Da AmtTranslator keine personenbezogenen Daten dauerhaft speichert, können 
            Auskunfts- und Löschanfragen in der Regel nicht beantwortet werden, da keine 
            Daten vorhanden sind.
          </p>
          <p className="text-sm">
            <span className="font-medium">Datenschutzbeauftragter:</span>{' '}
            datenschutz@guidetranslator.de
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">4. Besondere Kategorien (Art. 9 DSGVO)</h3>
          <p className="text-sm text-muted-foreground">
            Im Rahmen von Behördengesprächen können besondere Kategorien personenbezogener 
            Daten (z.B. Gesundheitsdaten, Aufenthaltsstatus) gesprochen werden. Diese werden 
            ausschließlich zur Übersetzung verarbeitet und nicht gespeichert. Die Verarbeitung 
            erfolgt auf Grundlage von Art. 9 Abs. 2 lit. g DSGVO (erhebliches öffentliches 
            Interesse) in Verbindung mit der behördlichen Aufgabenerfüllung.
          </p>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground text-center">
        Stand: März 2026 · AmtTranslator v1.0
      </p>
    </div>
  )
}
