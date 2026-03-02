import { Languages, Mic, Volume2, History, Globe, Shield, Radio, MessageCircle, Camera, Wifi, WifiOff, Subtitles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useI18n } from '@/context/I18nContext'
import type { LucideIcon } from 'lucide-react'

const FEATURE_ICONS: { icon: LucideIcon; key: string }[] = [
  { icon: Languages, key: '1' },
  { icon: Radio, key: '2' },
  { icon: MessageCircle, key: '3' },
  { icon: Camera, key: '4' },
  { icon: Subtitles, key: '5' },
  { icon: Mic, key: '6' },
  { icon: Volume2, key: '7' },
  { icon: WifiOff, key: '8' },
  { icon: Shield, key: '9' },
  { icon: Wifi, key: '10' },
  { icon: History, key: '11' },
  { icon: Globe, key: '12' },
]

// Native language names — universal, no translation needed
const LANGUAGES = [
  '\uD83C\uDDE9\uD83C\uDDEA Deutsch', '\uD83C\uDDEC\uD83C\uDDE7 English', '\uD83C\uDDEB\uD83C\uDDF7 Fran\u00e7ais', '\uD83C\uDDEA\uD83C\uDDF8 Espa\u00f1ol',
  '\uD83C\uDDEE\uD83C\uDDF9 Italiano', '\uD83C\uDDF5\uD83C\uDDF9 Portugu\u00eas', '\uD83C\uDDF3\uD83C\uDDF1 Nederlands', '\uD83C\uDDF5\uD83C\uDDF1 Polski',
  '\uD83C\uDDF9\uD83C\uDDF7 T\u00fcrk\u00e7e', '\uD83C\uDDF7\uD83C\uDDFA \u0420\u0443\u0441\u0441\u043a\u0438\u0439', '\uD83C\uDDFA\uD83C\uDDE6 \u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430', '\uD83C\uDDF8\uD83C\uDDE6 \u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  '\uD83C\uDDE8\uD83C\uDDF3 \u4e2d\u6587', '\uD83C\uDDEF\uD83C\uDDF5 \u65e5\u672c\u8a9e', '\uD83C\uDDF0\uD83C\uDDF7 \ud55c\uad6d\uc5b4', '\uD83C\uDDEE\uD83C\uDDF3 \u0939\u093f\u0928\u094d\u0926\u0940',
  '\uD83C\uDDF8\uD83C\uDDEA Svenska', '\uD83C\uDDE9\uD83C\uDDF0 Dansk', '\uD83C\uDDF3\uD83C\uDDF4 Norsk', '\uD83C\uDDE8\uD83C\uDDFF \u010ce\u0161tina',
  '\uD83C\uDDF7\uD83C\uDDF4 Rom\u00e2n\u0103', '\uD83C\uDDEC\uD83C\uDDF7 \u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac', '\uD83C\uDDED\uD83C\uDDFA Magyar', '\uD83C\uDDEB\uD83C\uDDEE Suomi',
  '\uD83C\uDDE7\uD83C\uDDEC \u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438', '\uD83C\uDDED\uD83C\uDDF7 Hrvatski', '\uD83C\uDDEE\uD83C\uDDF1 \u05e2\u05d1\u05e8\u05d9\u05ea', '\uD83C\uDDEA\uD83C\uDDEA Eesti',
  '\uD83C\uDDFB\uD83C\uDDF3 Ti\u1ebfng Vi\u1ec7t', '\uD83C\uDDF9\uD83C\uDDED \u0e44\u0e17\u0e22', '\uD83C\uDDEE\uD83C\uDDE9 Bahasa Indonesia', '\uD83C\uDDEE\uD83C\uDDF7 \u0641\u0627\u0631\u0633\u06cc',
]

export default function InfoPage() {
  const { t } = useI18n()

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('info.about')} <span className="gradient-text-translator">guidetranslator</span>
        </h1>
        <p className="text-muted-foreground">
          {t('info.subtitle')}
        </p>
        <div className="inline-flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
          v1.1 — {t('info.version')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURE_ICONS.map(({ icon: Icon, key }) => (
          <Card key={key} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg gradient-translator flex items-center justify-center mb-2">
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">{t(`info.feature${key}Title`)}</CardTitle>
              <CardDescription>{t(`info.feature${key}Desc`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('info.supportedLangs')} ({LANGUAGES.length})</CardTitle>
          <CardDescription>
            {LANGUAGES.length} {t('info.supportedLangsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {LANGUAGES.map(lang => (
              <div key={lang} className="text-sm px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
                {lang}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('info.transportTitle')}</CardTitle>
          <CardDescription>
            {t('info.transportDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-3 rounded-lg bg-secondary space-y-1">
                <strong>{t(`info.transport${n}Title`)}</strong>
                <p className="text-muted-foreground text-xs">{t(`info.transport${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('info.ecosystemTitle')}</CardTitle>
          <CardDescription>
            {t('info.ecosystemDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary">
              <strong>ai tour Portal</strong>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Vermietify</strong>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Ablesung</strong>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>BescheidBoxer</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
