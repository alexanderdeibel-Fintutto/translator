import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ImpressumPage() {
  return (
    <div className="container py-8 space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>
        <p className="text-muted-foreground text-sm">Angaben gemäß § 5 TMG</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anbieter</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>
            ai tour ug (haftungsbeschränkt)<br />
            Kolonie 2<br />
            18317 Saal<br />
            Deutschland
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vertreten durch</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>Geschäftsführer: Alexander Deibel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>
            E-Mail: info@guidetranslator.com<br />
            Web: <a href="https://guidetranslator.com" className="text-primary hover:underline">guidetranslator.com</a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registereintrag</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>
            Eintragung im Handelsregister<br />
            Registergericht: Amtsgericht Stralsund<br />
            Registernummer: 22827
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Umsatzsteuer-ID</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
            DE453800739
          </p>
          <p className="mt-2">
            Steuernummer: 081/105/00298
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Haftungsausschluss</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            <strong className="text-foreground">Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
          <p>
            <strong className="text-foreground">Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter,
            auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
            oder Betreiber der Seiten verantwortlich.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
