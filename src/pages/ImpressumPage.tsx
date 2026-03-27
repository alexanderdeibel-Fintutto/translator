function GlassSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-5">
      <h2 className="text-base font-semibold text-white drop-shadow mb-3">{title}</h2>
      <div className="text-sm text-white/85 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

export default function ImpressumPage() {
  return (
    <div className="relative max-w-3xl mx-auto space-y-6 py-8 px-4 text-white">
<div className="relative z-10 text-center space-y-2 pb-2">
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg">Impressum</h1>
        <p className="text-white/70 text-sm">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="relative z-10 space-y-4">
        <GlassSection title="Anbieter">
          <p>
            AI Tour Guide UG (haftungsbeschränkt)<br />
            Kolonie 2<br />
            18317 Saal<br />
            Deutschland
          </p>
        </GlassSection>

        <GlassSection title="Vertreten durch">
          <p>Geschäftsführer: Alexander Deibel</p>
        </GlassSection>

        <GlassSection title="Kontakt">
          <p>
            E-Mail: info@guidetranslator.com<br />
            Web: <a href="https://guidetranslator.com" className="text-sky-300 hover:underline">guidetranslator.com</a>
          </p>
        </GlassSection>

        <GlassSection title="Registereintrag">
          <p>
            Eintragung im Handelsregister<br />
            Registergericht: Amtsgericht Stralsund<br />
            Registernummer: HRB 22827
          </p>
        </GlassSection>

        <GlassSection title="Umsatzsteuer-ID">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
            DE453800739
          </p>
          <p className="mt-2">Steuernummer: 081/105/00298</p>
        </GlassSection>

        <GlassSection title="Haftungsausschluss">
          <div className="space-y-3">
            <p>
              <strong className="text-white">Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
            <p>
              <strong className="text-white">Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter,
              auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
          </div>
        </GlassSection>
      </div>
    </div>
  )
}
