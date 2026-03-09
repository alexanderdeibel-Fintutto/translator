import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ImpressumPage() {
  return (
    <div className="container py-8 space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>
        <p className="text-muted-foreground text-sm">Angaben gemaess § 5 TMG</p>
      </div>

      {/* Fintutto UG — Hauptanbieter (alle Bereiche ausser Enterprise) */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base">Anbieter</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-4">
          <p>
            <strong className="text-foreground">fintutto UG (haftungsbeschraenkt)</strong><br />
            Kolonie 2<br />
            18317 Saal<br />
            Deutschland
          </p>
          <p>
            <strong className="text-foreground">Geschaeftsfuehrer:</strong> Alexander Deibel
          </p>
          <p>
            <strong className="text-foreground">E-Mail:</strong> info@fintutto.de<br />
            <strong className="text-foreground">Web:</strong>{' '}
            <a href="https://fintutto.cloud" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">fintutto.cloud</a>
          </p>
          <p>
            <strong className="text-foreground">Registereintrag:</strong><br />
            Eintragung im Handelsregister<br />
            Registergericht: (Platzhalter)<br />
            Registernummer: HRB (Platzhalter)
          </p>
          <p>
            <strong className="text-foreground">Umsatzsteuer-ID:</strong><br />
            Umsatzsteuer-Identifikationsnummer gemaess § 27a UStG:<br />
            (Platzhalter)
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Die fintutto UG ist Anbieterin aller GuideTranslator-Produkte und -Dienstleistungen
            (Personal, Guide, Agentur, Event, Kreuzfahrt, Einzelunternehmer).
          </p>
        </CardContent>
      </Card>

      {/* ai tour guide ug — Enterprise-Lizenznehmerin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enterprise-Loesung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-4">
          <p className="text-xs text-muted-foreground/80 italic">
            Die Enterprise-Loesung von GuideTranslator wird exklusiv von der ai tour guide ug
            als Lizenznehmerin der fintutto UG angeboten und betrieben.
          </p>
          <p>
            <strong className="text-foreground">ai tour guide ug (haftungsbeschraenkt)</strong><br />
            Kolonie 2<br />
            18317 Saal<br />
            Deutschland
          </p>
          <p>
            <strong className="text-foreground">Geschaeftsfuehrer:</strong> Alexander Deibel
          </p>
          <p>
            <strong className="text-foreground">E-Mail:</strong> info@guidetranslator.com<br />
            <strong className="text-foreground">Web:</strong>{' '}
            <a href="https://guidetranslator.com" className="text-primary hover:underline">guidetranslator.com</a>
          </p>
          <p>
            <strong className="text-foreground">Registereintrag:</strong><br />
            Eintragung im Handelsregister<br />
            Registergericht: Amtsgericht Stralsund<br />
            Registernummer: 22827
          </p>
          <p>
            <strong className="text-foreground">Umsatzsteuer-ID:</strong><br />
            Umsatzsteuer-Identifikationsnummer gemaess § 27a UStG:<br />
            DE453800739
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Steuernummer:</strong> 081/105/00298
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Haftungsausschluss</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            <strong className="text-foreground">Haftung fuer Inhalte:</strong> Die Inhalte unserer Seiten wurden mit groesster Sorgfalt erstellt.
            Fuer die Richtigkeit, Vollstaendigkeit und Aktualitaet der Inhalte koennen wir jedoch keine Gewaehr uebernehmen.
            Als Diensteanbieter sind wir gemaess § 7 Abs.1 TMG fuer eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
          <p>
            <strong className="text-foreground">Haftung fuer Links:</strong> Unser Angebot enthaelt Links zu externen Websites Dritter,
            auf deren Inhalte wir keinen Einfluss haben. Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
            oder Betreiber der Seiten verantwortlich.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
