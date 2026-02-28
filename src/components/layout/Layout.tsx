import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useI18n } from '@/context/I18nContext'

export default function Layout() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to content — accessible keyboard shortcut */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        {t('layout.skipToContent')}
      </a>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
