import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.fintutto.artguide',
  appName: 'Fintutto Art Guide',
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
    Camera: {
      // QR code scanning
    },
    Geolocation: {
      // GPS for outdoor venues
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'fintuttoartguide',
    // BLE permissions for iBeacon scanning
    // Add to Info.plist:
    //   NSBluetoothAlwaysUsageDescription: "Art Guide uses Bluetooth to detect your position in the museum."
    //   NSLocationWhenInUseUsageDescription: "Art Guide uses your location for outdoor venues."
    //   NSCameraUsageDescription: "Art Guide uses the camera to scan QR codes."
    //   NSMicrophoneUsageDescription: "Art Guide uses the microphone for voice interaction."
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
    // Permissions needed in AndroidManifest.xml:
    //   BLUETOOTH, BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_CONNECT
    //   ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
    //   CAMERA
    //   RECORD_AUDIO
  },
}

export default config
