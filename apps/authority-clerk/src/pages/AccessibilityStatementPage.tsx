/**
 * Accessibility Statement — AmtTranslator
 * Barrierefreiheitserklärung nach § 12 BITV 2.0 / § 10 BGG
 * Pflichtangabe für öffentliche Stellen und deren Dienstleister
 */

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AccessibilityStatementPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Barrierefreiheitserklärung</h1>
        <p className="text-muted-foreground mt-1">
          Gemäß § 12 Behindertengleichstellungsgesetz (BGG) und der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0)
        </p>
      </div>

      {/* Compliance Status */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Konformitätsstatus</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Teilweise konform</p>
              <p className="text-sm text-muted-foreground">
                AmtTranslator ist mit den Anforderungen der WCAG 2.1 Level AA und BITV 2.0 
                teilweise konform. Die nachfolgend aufgeführten Ausnahmen bestehen.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Conformant Features */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Erfüllte Anforderungen
        </h2>
        <ul className="space-y-2 text-sm">
          {[
            'Tastaturnavigation: Alle Funktionen sind per Tastatur erreichbar (WCAG 2.1.1)',
            'Fokus-Indikatoren: Sichtbarer Fokus bei Tastaturnavigation (WCAG 2.4.7)',
            'Farbkontrast: Mindest-Kontrastverhältnis 4.5:1 für normalen Text (WCAG 1.4.3)',
            'Schriftgröße: Skalierbar bis 200% ohne Funktionsverlust (WCAG 1.4.4)',
            'Sprachauszeichnung: HTML-lang-Attribut korrekt gesetzt (WCAG 3.1.1)',
            'Alternativtexte: Alle informativen Bilder haben Alt-Texte (WCAG 1.1.1)',
            'ARIA-Labels: Interaktive Elemente haben zugängliche Bezeichnungen (WCAG 4.1.2)',
            'RTL-Support: Rechts-nach-links-Sprachen (Arabisch, Persisch, Urdu) werden korrekt dargestellt',
            'Hoher Kontrast: Modus für erhöhten Kontrast verfügbar',
            'Schriftgrößen-Anpassung: Drei Größenstufen (Normal, Groß, Sehr groß)',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Non-conformant Features */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Bekannte Einschränkungen
        </h2>
        <ul className="space-y-3 text-sm">
          {[
            {
              issue: 'Sprachsteuerung (Push-to-Talk)',
              detail: 'Die Push-to-Talk-Funktion erfordert eine Zeigevorrichtung (Touch/Maus). Eine reine Tastaturalternative ist in Entwicklung.',
              wcag: 'WCAG 2.1.1',
              status: 'In Bearbeitung',
            },
            {
              issue: 'Live-Untertitel',
              detail: 'Echtzeit-Untertitel für die TTS-Ausgabe sind noch nicht implementiert.',
              wcag: 'WCAG 1.2.4',
              status: 'Geplant für v2.0',
            },
            {
              issue: 'Gebärdensprach-Videos',
              detail: 'Erklärvideos in Deutscher Gebärdensprache (DGS) sind nicht verfügbar.',
              wcag: 'BITV 2.0 Anlage 1',
              status: 'Geplant',
            },
          ].map((item, i) => (
            <li key={i} className="border rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.issue}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {item.status}
                </span>
              </div>
              <p className="text-muted-foreground">{item.detail}</p>
              <p className="text-xs text-muted-foreground">Betroffene Anforderung: {item.wcag}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Timeline */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Erstellungs- und Überprüfungsdatum
        </h2>
        <div className="text-sm space-y-2">
          <p><span className="font-medium">Erstellt:</span> März 2026</p>
          <p><span className="font-medium">Letzte Überprüfung:</span> März 2026</p>
          <p><span className="font-medium">Nächste Überprüfung:</span> September 2026</p>
          <p><span className="font-medium">Prüfmethode:</span> Selbstbewertung nach WCAG 2.1 und BITV 2.0</p>
        </div>
      </Card>

      {/* Feedback */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5 text-teal-600" />
          Feedback und Kontakt
        </h2>
        <p className="text-sm text-muted-foreground">
          Wenn Sie Barrieren in unserer Anwendung feststellen oder Verbesserungsvorschläge haben, 
          wenden Sie sich bitte an uns:
        </p>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Anbieter:</span> Fintutto GmbH / GuideTranslator</p>
          <p><span className="font-medium">E-Mail:</span> barrierefreiheit@fintutto.world</p>
          <p><span className="font-medium">Bearbeitungszeit:</span> Innerhalb von 2 Wochen</p>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <p className="font-medium mb-1">Schlichtungsverfahren</p>
          <p className="text-muted-foreground">
            Wenn Sie auf Ihre Anfrage keine zufriedenstellende Antwort erhalten haben, können Sie 
            die Schlichtungsstelle nach § 16 BGG einschalten:{' '}
            <a
              href="https://www.schlichtungsstelle-bgg.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline"
            >
              www.schlichtungsstelle-bgg.de
            </a>
          </p>
        </div>
      </Card>

      {/* Technical Info */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Technische Spezifikationen</h2>
        <div className="text-sm space-y-2">
          <p>AmtTranslator wurde mit folgenden Technologien entwickelt, die auf Barrierefreiheit ausgelegt sind:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>React 18 mit semantischem HTML5</li>
            <li>ARIA-Attribute (WAI-ARIA 1.2)</li>
            <li>CSS-Variablen für Kontrast-Anpassung</li>
            <li>Progressive Web App (PWA) mit Offline-Unterstützung</li>
            <li>Web Speech API für Spracheingabe und -ausgabe</li>
          </ul>
          <p className="mt-3">
            <span className="font-medium">Getestete Browser:</span>{' '}
            Chrome 120+, Safari 17+ (iOS), Firefox 121+, Edge 120+
          </p>
          <p>
            <span className="font-medium">Getestete Hilfsmittel:</span>{' '}
            NVDA 2024.1, VoiceOver (iOS 17), TalkBack (Android 14)
          </p>
        </div>
      </Card>
    </div>
  )
}
