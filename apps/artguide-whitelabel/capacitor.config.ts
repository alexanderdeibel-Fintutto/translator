import type { CapacitorConfig } from '@capacitor/cli'

// Default config — overwritten by build-whitelabel.ts per museum
const config: CapacitorConfig = {
  appId: 'com.fintutto.artguide.whitelabel',
  appName: 'Art Guide',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1e1b4b',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e1b4b',
    },
    Camera: {},
    Geolocation: {},
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'artguidewhitelabel',
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
