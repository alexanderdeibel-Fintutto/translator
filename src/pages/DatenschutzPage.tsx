import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function DatenschutzPage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
        {children}
      </CardContent>
    </Card>
  )

  return (
    <div className="container py-8 space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>
        <p className="text-muted-foreground text-sm">Stand: Februar 2026</p>
      </div>

      <Section title="1. Datenschutz auf einen Blick">
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
          wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
        </p>
      </Section>

      <Section title="2. Verantwortliche Stelle">
        <p>
          ai tour ug (haftungsbeschränkt)<br />
          Kolonie 2<br />
          18317 Saal<br />
          E-Mail: datenschutz@guidetranslator.com
        </p>
      </Section>

      <Section title="3. Datenerfassung auf dieser Website">
        <p>
          <strong className="text-foreground">Wer ist verantwortlich für die Datenerfassung?</strong><br />
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber (ai tour ug (haftungsbeschränkt)).
        </p>
        <p>
          <strong className="text-foreground">Wie erfassen wir Ihre Daten?</strong><br />
          Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. Texteingaben zur Übersetzung).
          Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst
          (z.B. Browser, Betriebssystem, Uhrzeit des Seitenaufrufs).
        </p>
        <p>
          <strong className="text-foreground">Wofür nutzen wir Ihre Daten?</strong><br />
          Die eingegebenen Texte werden ausschließlich zur Übersetzung an die gewählte Übersetzungs-API übermittelt.
          Der Übersetzungsverlauf wird nur lokal in Ihrem Browser gespeichert und nicht an unsere Server übertragen.
        </p>
      </Section>

      <Section title="4. Übersetzungs-APIs">
        <p>
          Für die Übersetzung nutzen wir je nach Verfügbarkeit folgende Dienste:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Google Cloud Translation API</strong> — Texte werden zur Übersetzung an Google-Server übermittelt. Es gelten die Datenschutzbestimmungen von Google.</li>
          <li><strong className="text-foreground">Offline-Übersetzung</strong> — Bei heruntergeladenen Sprachpaketen werden Texte lokal auf Ihrem Gerät übersetzt. Keine Daten verlassen Ihr Gerät.</li>
        </ul>
      </Section>

      <Section title="5. Spracherkennung und Sprachausgabe">
        <p>
          <strong className="text-foreground">Spracheingabe (STT):</strong> Je nach Einstellung wird entweder die Browser-eigene
          Spracherkennung (Web Speech API) oder das lokale Whisper-Modell verwendet. Bei der Web Speech API können Audiodaten
          an die Server des Browser-Herstellers übermittelt werden. Das Whisper-Modell arbeitet vollständig lokal.
        </p>
        <p>
          <strong className="text-foreground">Sprachausgabe (TTS):</strong> Für die Sprachausgabe nutzen wir Google Cloud Text-to-Speech.
          Die zu sprechenden Texte werden an Google-Server übermittelt. Im Offline-Modus wird die Browser-eigene Sprachsynthese verwendet.
        </p>
      </Section>

      <Section title="6. Lokale Datenspeicherung (Offline-Modus)">
        <p>
          Für den Offline-Modus speichern wir Daten lokal in Ihrem Browser (IndexedDB und localStorage).
          Dazu gehören: heruntergeladene Sprachmodelle, ein Cache häufiger Übersetzungen und TTS-Audio-Clips.
          Diese Daten verlassen nicht Ihr Gerät. Sie können diese jederzeit über die Einstellungen oder
          durch Löschen Ihrer Browser-Daten entfernen.
        </p>
      </Section>

      <Section title="7. Live-Übersetzungssitzungen">
        <p>
          Bei Nutzung der Live-Übersetzungsfunktion werden Texte über Supabase Realtime-Channels an andere
          Sitzungsteilnehmer übermittelt. Die Verbindung ist verschlüsselt. Es werden keine Audio-Aufnahmen
          übertragen, nur der erkannte Text und die Übersetzung.
        </p>
      </Section>

      <Section title="8. Ihre Rechte">
        <p>
          Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten,
          deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung,
          Sperrung oder Löschung dieser Daten.
        </p>
        <p>
          Kontakt: datenschutz@guidetranslator.com
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>
          Diese Website verwendet keine Tracking-Cookies. Es werden lediglich technisch notwendige lokale
          Speichermechanismen (localStorage, IndexedDB) verwendet, um die Funktionalität der Anwendung
          zu gewährleisten.
        </p>
      </Section>
    </div>
  )
}
