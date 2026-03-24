import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cloud.fintutto.school.teacher',
  appName: 'School Translator - Lehrer',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#2563eb',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2563eb',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'schooltranslatorteacher',
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
