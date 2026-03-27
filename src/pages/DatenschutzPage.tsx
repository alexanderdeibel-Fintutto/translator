function GlassSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-5">
      <h2 className="text-base font-semibold text-white drop-shadow mb-3">{title}</h2>
      <div className="text-sm text-white/85 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}

export default function DatenschutzPage() {
  return (
    <div className="relative max-w-3xl mx-auto space-y-6 py-8 px-4 text-white">
      {/* Hintergrund-Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.22]" />
      </div>

      <div className="relative z-10 text-center space-y-2 pb-2">
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg">Datenschutzerklärung</h1>
        <p className="text-white/70 text-sm">Stand: Februar 2026</p>
      </div>

      <div className="relative z-10 space-y-4">
        <GlassSection title="1. Datenschutz auf einen Blick">
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
            wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>
        </GlassSection>

        <GlassSection title="2. Verantwortliche Stelle">
          <p>
            AI Tour Guide UG (haftungsbeschränkt)<br />
            Kolonie 2<br />
            18317 Saal<br />
            E-Mail: datenschutz@guidetranslator.com
          </p>
        </GlassSection>

        <GlassSection title="3. Datenerfassung auf dieser Website">
          <p>
            <strong className="text-white">Wer ist verantwortlich für die Datenerfassung?</strong><br />
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber (AI Tour Guide UG (haftungsbeschränkt)).
          </p>
          <p>
            <strong className="text-white">Wie erfassen wir Ihre Daten?</strong><br />
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. Texteingaben zur Übersetzung).
            Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst
            (z.B. Browser, Betriebssystem, Uhrzeit des Seitenaufrufs).
          </p>
          <p>
            <strong className="text-white">Wofür nutzen wir Ihre Daten?</strong><br />
            Die eingegebenen Texte werden ausschließlich zur Übersetzung an die gewählte Übersetzungs-API übermittelt.
            Der Übersetzungsverlauf wird nur lokal in Ihrem Browser gespeichert und nicht an unsere Server übertragen.
          </p>
        </GlassSection>

        <GlassSection title="4. Übersetzungs-APIs">
          <p>Für die Übersetzung nutzen wir je nach Verfügbarkeit folgende Dienste:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-white">Google Cloud Translation API</strong> — Texte werden zur Übersetzung an Google-Server übermittelt. Es gelten die Datenschutzbestimmungen von Google.</li>
            <li><strong className="text-white">Offline-Übersetzung</strong> — Bei heruntergeladenen Sprachpaketen werden Texte lokal auf Ihrem Gerät übersetzt. Keine Daten verlassen Ihr Gerät.</li>
          </ul>
        </GlassSection>

        <GlassSection title="5. Spracherkennung und Sprachausgabe">
          <p>
            <strong className="text-white">Spracheingabe (STT):</strong> Je nach Einstellung wird entweder die Browser-eigene
            Spracherkennung (Web Speech API) oder das lokale Whisper-Modell verwendet. Bei der Web Speech API können Audiodaten
            an die Server des Browser-Herstellers übermittelt werden. Das Whisper-Modell arbeitet vollständig lokal.
          </p>
          <p>
            <strong className="text-white">Sprachausgabe (TTS):</strong> Für die Sprachausgabe nutzen wir Google Cloud Text-to-Speech.
            Die zu sprechenden Texte werden an Google-Server übermittelt. Im Offline-Modus wird die Browser-eigene Sprachsynthese verwendet.
          </p>
        </GlassSection>

        <GlassSection title="6. Lokale Datenspeicherung (Offline-Modus)">
          <p>
            Für den Offline-Modus speichern wir Daten lokal in Ihrem Browser (IndexedDB und localStorage).
            Dazu gehören: heruntergeladene Sprachmodelle, ein Cache häufiger Übersetzungen und TTS-Audio-Clips.
            Diese Daten verlassen nicht Ihr Gerät. Sie können diese jederzeit über die Einstellungen oder
            durch Löschen Ihrer Browser-Daten entfernen.
          </p>
        </GlassSection>

        <GlassSection title="7. Live-Übersetzungssitzungen">
          <p>
            Bei Nutzung der Live-Übersetzungsfunktion werden Texte über Supabase Realtime-Channels an andere
            Sitzungsteilnehmer übermittelt. Die Verbindung ist verschlüsselt. Es werden keine Audio-Aufnahmen
            übertragen, nur der erkannte Text und die Übersetzung.
          </p>
        </GlassSection>

        <GlassSection title="8. Ihre Rechte">
          <p>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten,
            deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung,
            Sperrung oder Löschung dieser Daten.
          </p>
          <p>Kontakt: datenschutz@guidetranslator.com</p>
        </GlassSection>

        <GlassSection title="9. Cookies">
          <p>
            Diese Website verwendet keine Tracking-Cookies. Es werden lediglich technisch notwendige lokale
            Speichermechanismen (localStorage, IndexedDB) verwendet, um die Funktionalität der Anwendung
            zu gewährleisten.
          </p>
        </GlassSection>
      </div>
    </div>
  )
}
