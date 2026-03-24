// Apple SpeechAnalyzer STT stub for iOS 26+
// Will be activated when WebKit exposes the SpeechAnalyzer API

export interface AppleSttConfig {
  language: string
  continuous: boolean
  interimResults: boolean
}

export function isAppleSttAvailable(): boolean {
  // SpeechAnalyzer API not yet available in WebKit
  // Will check: 'SpeechAnalyzer' in window
  return false
}

export async function startAppleStt(config: AppleSttConfig): Promise<void> {
  throw new Error('Apple SpeechAnalyzer not yet available. Requires iOS 26+ with WebKit SpeechAnalyzer API.')
}

export function stopAppleStt(): void {
  // no-op until API available
}

// Feature detection for future activation
export function getAppleSttCapabilities(): { available: boolean; languages: string[]; reason: string } {
  return {
    available: false,
    languages: [],
    reason: 'SpeechAnalyzer API not yet exposed in WebKit. Expected in iOS 26+.',
  }
}
