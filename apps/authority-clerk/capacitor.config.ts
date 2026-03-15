import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cloud.fintutto.authority.clerk',
  appName: 'Amt Translator - Sachbearbeiter',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#0f766e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f766e',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'amttranslatorclerk',
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
