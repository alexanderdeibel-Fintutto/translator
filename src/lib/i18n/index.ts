// Internationalization system for the app UI
// Supports: DE, EN, AR, TR, FA, UK, RU, FR, ES
// DE is bundled inline (default/fallback). Other locales are lazy-loaded.

export type UILanguage = 'de' | 'en' | 'ar' | 'tr' | 'fa' | 'uk' | 'ru' | 'fr' | 'es'

export const UI_LANGUAGES: { code: UILanguage; name: string; nativeName: string; flag: string; rtl?: boolean }[] = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabisch', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', name: 'Türkisch', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'uk', name: 'Ukrainisch', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Russisch', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Französisch', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanisch', nativeName: 'Español', flag: '🇪🇸' },
]

export function isUILanguageRTL(code: UILanguage): boolean {
  return code === 'ar' || code === 'fa'
}

type TranslationStrings = Record<string, string>

// Default language — always bundled (no async load needed)
const de: TranslationStrings = {
  // Header & Navigation
  'nav.translator': '\u00dcbersetzer',
  'nav.live': 'Live',
  'nav.conversation': 'Gespr\u00e4ch',
  'nav.camera': 'Kamera',
  'nav.phrasebook': 'Phrasebook',
  'nav.info': 'Info',
  'nav.settings': 'Einstellungen',
  'status.online': 'Online',
  'status.degraded': 'Instabil',
  'status.offline': 'Offline',
  'theme.light': 'Heller Modus',
  'theme.dark': 'Dunkler Modus',
  'lang.select': 'Sprache w\u00e4hlen',

  // Translator
  'translator.title': '\u00dcbersetzer',
  'translator.subtitle': 'Texte kostenlos \u00fcbersetzen, vorlesen lassen und per Spracheingabe diktieren. 45 Sprachen verf\u00fcgbar.',
  'translator.languages': '45 Sprachen',
  'translator.speechInput': 'Spracheingabe',
  'translator.instantTranslation': 'Sofort-\u00dcbersetzung',
  'translator.free': 'Kostenlos',
  'translator.liveSession': 'Live-Session',
  'translator.from': 'Von',
  'translator.to': 'Nach',
  'translator.auto': 'Auto',
  'translator.placeholder': 'Text eingeben oder einsprechen...',
  'translator.translating': 'Wird \u00fcbersetzt...',
  'translator.result': '\u00dcbersetzung erscheint hier...',
  'translator.chars': 'Zeichen',
  'translator.recording': 'Aufnahme l\u00e4uft...',
  'translator.copy': 'Kopieren',
  'translator.speak': 'Vorlesen',
  'translator.stop': 'Stoppen',
  'translator.delete': 'L\u00f6schen',
  'translator.swap': 'Sprachen tauschen',
  'translator.searchLang': 'Sprache suchen...',
  'translator.noLangFound': 'Keine Sprache gefunden',
  'translator.formal': 'Sie',
  'translator.informal': 'Du',
  'translator.shortcutHint': 'Ctrl+Enter = sofort · Esc = löschen',
  'translator.micUnavailable': 'Spracheingabe nicht verfügbar. Bitte prüfen Sie Ihre Browser-Einstellungen und Internetverbindung.',
  'translator.autoDetect': 'Sprache automatisch erkennen',
  'translator.autoSpeakOn': 'Auto-Vorlesen aktiv',
  'translator.autoSpeakOff': 'Auto-Vorlesen aus',
  'translator.hdVoiceOn': 'HD-Stimme aktiv (Chirp 3 HD)',
  'translator.sdVoice': 'Standard-Stimme (Neural2)',
  'translator.formalityHint': 'Formalität — Zielsprache wechseln zu DE, FR, ES...',
  'translator.micNotAvailable': 'Spracheingabe nicht verfügbar',
  'translator.stopRecording': 'Aufnahme stoppen',
  'translator.share': 'Teilen',
  'translator.goodTranslation': 'Gute Übersetzung',
  'translator.badTranslation': 'Schlechte Übersetzung',

  'translator.sentence': 'Satz',
  'translator.paragraph': 'Absatz',
  'translator.sentenceMode': 'Satzweise Übersetzung — jeder Satz wird sofort übersetzt',
  'translator.paragraphMode': 'Absatz-Übersetzung — Text sammeln, dann mit Senden übersetzen',
  'translator.send': 'Senden und übersetzen',

  // Phrasebook
  'phrasebook.title': 'Phrasebook',
  'phrasebook.subtitle': 'Wichtige S\u00e4tze f\u00fcr Beh\u00f6rden, Arzt, Wohnung, Arbeit, Schule, Polizei und Alltag.',
  'phrasebook.all': 'Alle',
  'phrasebook.empty': 'Keine Phrasen in dieser Kategorie.',
  'phrasebook.translateAll': 'Alle übersetzen',

  // Quick Phrases
  'phrases.title': 'H\u00e4ufige S\u00e4tze',

  // History
  'history.title': '\u00dcbersetzungsverlauf',
  'history.clear': 'Verlauf l\u00f6schen',
  'history.empty': 'Noch keine \u00dcbersetzungen',

  // Live Session
  'live.title': 'Live-\u00dcbersetzung',
  'live.create': 'Session erstellen',
  'live.join': 'Session beitreten',
  'live.startRecording': 'Aufnahme starten',
  'live.pause': 'Pause',
  'live.endSession': 'Session beenden',
  'live.endSessionConfirmTitle': 'Session wirklich beenden?',
  'live.endSessionConfirmDesc': '{count} Zuhörer sind aktuell verbunden. Wenn du die Session beendest, werden alle Verbindungen getrennt.',
  'live.slideToEnd': 'Schieben zum Beenden',
  'live.cancel': 'Abbrechen',
  'live.recording': 'Live-Aufnahme',
  'live.disconnected': 'Verbindung unterbrochen \u2014 Versuche erneut zu verbinden...',
  'live.downloadProtocol': 'Protokoll herunterladen',
  'live.listenersConnected': 'Listener verbunden',
  'live.waitingForListeners': 'Warte auf Listener... Teile den QR-Code oder Link.',
  'live.waitingForSpeaker': 'Warte auf Übersetzungen vom Speaker...',
  'live.startToTranslate': 'Starte die Aufnahme, um zu übersetzen...',

  // Conversation
  'conversation.title': 'Konversation',
  'conversation.subtitle': 'Face-to-Face Übersetzung für zwei Personen',
  'conversation.speak': 'Sprechen',
  'conversation.you': 'Du',
  'conversation.other': 'Gegenüber',
  'conversation.restart': 'Neu starten',
  'conversation.translating': 'Wird übersetzt...',
  'conversation.stop': 'Stop',
  'conversation.person1': 'Person 1',
  'conversation.person2': 'Person 2',

  // Camera
  'camera.title': 'Kamera-Übersetzer',
  'camera.subtitle': 'Fotografiere Text und übersetze ihn sofort',
  'camera.capture': 'Foto aufnehmen',
  'camera.gallery': 'Aus Galerie',
  'camera.extracting': 'Text wird erkannt...',
  'camera.extracted': 'Erkannter Text',
  'camera.translation': 'Übersetzung',
  'camera.hint': 'Richte die Kamera auf ein Schild, Menü oder Dokument',

  // Errors
  'error.offlineNoModel': 'Offline — kein Sprachmodell für dieses Sprachpaar heruntergeladen. Gehe zu Einstellungen → Offline-Sprachen.',
  'error.allProvidersFailed': 'Übersetzung fehlgeschlagen — bitte versuche es erneut.',
  'error.unknown': 'Ein Fehler ist aufgetreten.',
  'error.networkDownload': 'Download fehlgeschlagen — bitte Internetverbindung pruefen und erneut versuchen.',
  'error.cameraNoApiKey': 'Kamera-Übersetzung benötigt einen Google Cloud API-Key. Bitte in den Einstellungen konfigurieren.',
  'error.cameraOcrFailed': 'Texterkennung fehlgeschlagen. Bitte versuche es erneut.',
  'error.cameraNoText': 'Kein Text im Bild erkannt.',

  // 404
  'notFound.title': 'Seite nicht gefunden',
  'notFound.description': 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
  'notFound.back': 'Zurück',
  'notFound.home': 'Startseite',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Offline-Modus, Sprachpakete und Speicher verwalten',
  'settings.network': 'Netzwerk',
  'settings.networkOnline': 'Online — Cloud-Übersetzung aktiv',
  'settings.networkDegraded': 'Instabile Verbindung — Offline-Modus bereit',
  'settings.networkOffline': 'Offline — Nur heruntergeladene Sprachen verfügbar',
  'settings.storage': 'Speicher',
  'settings.apiKey': 'Google Cloud API-Key',
  'settings.apiKeyDesc': 'Für Cloud-Übersetzung, TTS (Neural2/Chirp) und Kamera-OCR. Ohne Key werden kostenlose Alternativen genutzt.',
  'settings.apiKeySave': 'Speichern',
  'settings.apiKeySaved': 'Gespeichert',
  'settings.apiKeyActive': 'API-Key konfiguriert — Cloud-Features aktiv',
  'settings.apiKeyInactive': 'Kein API-Key — nur kostenlose Provider',
  'settings.offlineLangs': 'Offline-Sprachen',
  'settings.offlineLangsDesc': 'Lade Sprachpakete herunter, um auch ohne Internet übersetzen zu können (~35 MB pro Paar).',
  'settings.whisper': 'Offline-Spracheingabe (Whisper)',
  'settings.whisperDesc': 'Whisper ermöglicht Spracherkennung ohne Internet (~150 MB). Funktioniert in allen Browsern.',
  'settings.whisperReady': 'Whisper-Modell bereit',
  'settings.whisperDownload': 'Whisper herunterladen (~150 MB)',
  'settings.cache': 'Cache verwalten',
  'settings.translationCache': 'Übersetzungs-Cache',
  'settings.ttsCache': 'TTS Audio-Cache',
  'settings.entries': 'Einträge',
  'settings.audioClips': 'Audio-Clips',
  'settings.clear': 'Leeren',
  'settings.safariHintTitle': 'Tipp für iOS Safari:',
  'settings.safariHintText': 'Füge diese App zum Home-Bildschirm hinzu, damit deine Offline-Daten nicht nach 7 Tagen gelöscht werden. Tippe auf',
  'settings.safariHintShare': 'Teilen ↑',
  'settings.safariHintHome': 'Zum Home-Bildschirm',
  'settings.ready': 'Bereit',
  'settings.deleteLanguagePack': 'Sprachpaket löschen',
  'settings.downloadPack': 'Laden',

  // Live Landing
  'liveLanding.title': 'Live-Modus',
  'liveLanding.subtitle': 'Übersetze in Echtzeit für ein Publikum oder höre als Zuhörer zu.',
  'liveLanding.speaker': 'Speaker',
  'liveLanding.createSession': 'Session erstellen',
  'liveLanding.speakerDesc': 'Starte eine Live-Sitzung und übersetze in Echtzeit für dein Publikum.',
  'liveLanding.iSpeak': 'Ich spreche',
  'liveLanding.connection': 'Verbindung',
  'liveLanding.mobileOnly': 'Nur auf Mobilgeräten verfügbar',
  'liveLanding.hotspotTitle': 'Hotspot-Modus',
  'liveLanding.hotspotAutoDesc': 'Dein Gerät erstellt automatisch einen WiFi-Hotspot. Zuhörer verbinden sich direkt.',
  'liveLanding.hotspotManualDesc': 'Erstelle manuell einen Hotspot. Zuhörer verbinden sich mit deinem WiFi.',
  'liveLanding.hotspotLimit': 'Funktioniert komplett ohne Internet',
  'liveLanding.bleTitle': 'Bluetooth LE Direkt',
  'liveLanding.bleDesc': 'Verbindung via Bluetooth Low Energy. Kein WiFi nötig — ideal für Outdoor.',
  'liveLanding.bleLimit': 'Reichweite: ca. 10–30 Meter',
  'liveLanding.relayAddress': 'Relay-Server Adresse',
  'liveLanding.relayAddressHint': 'Adresse des Relay-Servers auf dem portablen WiFi-Router',
  'liveLanding.startSession': 'Session starten',
  'liveLanding.listener': 'Listener',
  'liveLanding.joinSession': 'Session beitreten',
  'liveLanding.listenerDesc': 'Scanne den QR-Code des Speakers oder gib den Session-Code ein.',
  'liveLanding.nearbySessions': 'Sessions in der Nähe',
  'liveLanding.join': 'Beitreten',
  'liveLanding.scanning': 'Suche nach Sessions in der Nähe...',

  // Live Session (join page)
  'liveSession.joining': 'Session beitreten',
  'liveSession.bleDirect': 'BLE Direkt (Offline)',
  'liveSession.localNetwork': 'Lokales Netzwerk (Offline-Modus)',
  'liveSession.cloudConnection': 'Cloud-Verbindung',
  'liveSession.chooseLanguage': 'In welcher Sprache möchtest du hören?',
  'liveSession.join': 'Beitreten',

  // Info Page
  'info.about': 'Über',
  'info.subtitle': 'Die einzige Übersetzungs-App mit Live-Broadcast an unbegrenzt viele Zuhörer — komplett offline. Für Stadtführungen, Museen, Behördengänge und den Alltag.',
  'info.version': '54 Offline-Sprachpaare, 4 Transport-Layer, E2E-Verschlüsselung',
  'info.supportedLangs': 'Unterstützte Sprachen',
  'info.supportedLangsDesc': 'Sprachen werden unterstützt. 54 Offline-Sprachpaare via Opus-MT (je ~35MB). Nicht-englische Paare werden automatisch über Englisch als Pivot-Sprache übersetzt.',
  'info.transportTitle': 'Transport-Architektur',
  'info.transportDesc': '4 Transport-Layer für maximale Verfügbarkeit — kein anderer Übersetzer bietet das.',
  'info.transport1Title': '1. Cloud (Supabase)',
  'info.transport1Desc': 'Echtzeit-Broadcast via WebSocket. Unbegrenzte Reichweite.',
  'info.transport2Title': '2. Lokales WiFi',
  'info.transport2Desc': 'WebSocket-Relay im lokalen Netzwerk. Kein Internet nötig.',
  'info.transport3Title': '3. Hotspot',
  'info.transport3Desc': 'Speaker-Handy erstellt eigenes WiFi + Relay-Server.',
  'info.transport4Title': '4. Bluetooth LE',
  'info.transport4Desc': 'GATT Server/Client. Funktioniert komplett ohne Netzwerk.',
  'info.ecosystemTitle': 'Teil des ai tour Ökosystems',
  'info.ecosystemDesc': 'guidetranslator ist Teil der ai tour Plattform für Finanzen, Immobilien und Verwaltung.',
  'info.feature1Title': '54+ Offline-Sprachpaare',
  'info.feature1Desc': 'Übersetze zwischen 40+ Sprachen — von Deutsch über Arabisch bis Chinesisch, Japanisch, Koreanisch, Hindi und viele mehr.',
  'info.feature2Title': 'Live-Sessions (1→N)',
  'info.feature2Desc': 'Ein Speaker spricht, unbegrenzt viele Zuhörer hören die Übersetzung in ihrer Sprache. QR-Code scannen, fertig.',
  'info.feature3Title': 'Konversationsmodus',
  'info.feature3Desc': 'Face-to-Face Übersetzung: Zwei Personen sprechen abwechselnd. Ideal für Arztbesuche oder Behördengänge.',
  'info.feature4Title': 'Kamera-Übersetzer',
  'info.feature4Desc': 'Fotografiere Schilder, Menüs oder Dokumente — der Text wird erkannt und sofort übersetzt.',
  'info.feature5Title': 'Live-Untertitel',
  'info.feature5Desc': 'Listener sehen Übersetzungen als Echtzeit-Untertitel — inklusive Vollbild-Modus.',
  'info.feature6Title': 'Spracheingabe (Online + Offline)',
  'info.feature6Desc': 'Web Speech API für Chrome/Edge, Whisper-Modell (~150 MB) für vollständig offline STT.',
  'info.feature7Title': 'HD-Sprachausgabe',
  'info.feature7Desc': 'Google Cloud TTS mit Neural2 und Chirp 3 HD Stimmen. Automatisches Caching.',
  'info.feature8Title': '4-stufiges Offline-System',
  'info.feature8Desc': 'Cloud → Lokales WiFi → Hotspot → Bluetooth LE. Funktioniert auch ohne Internet.',
  'info.feature9Title': 'E2E-Verschlüsselung',
  'info.feature9Desc': 'AES-256-GCM Verschlüsselung für alle lokalen Transporte. Kein Server sieht eure Übersetzungen.',
  'info.feature10Title': 'Auto-Spracherkennung',
  'info.feature10Desc': 'Erkennt automatisch die Quellsprache anhand von Unicode-Script-Analyse — komplett offline.',
  'info.feature11Title': 'Session-Protokoll Export',
  'info.feature11Desc': 'Lade ein vollständiges Transkript als Text oder Markdown herunter.',
  'info.feature12Title': 'Kostenlos & Open Source',
  'info.feature12Desc': 'Keine Kosten pro Zuhörer oder Minute. PWA-Installation für schnellen Offline-Zugriff.',

  // Layout
  'layout.skipToContent': 'Zum Inhalt springen',

  // Header
  'header.homeAriaLabel': 'guidetranslator — Startseite',
  'header.menuClose': 'Navigation schließen',
  'header.menuOpen': 'Navigation öffnen',
  'nav.mainNavigation': 'Hauptnavigation',

  // Protocol export
  'protocol.title': 'Session-Protokoll',
  'protocol.field': 'Feld',
  'protocol.value': 'Wert',
  'protocol.session': 'Session',
  'protocol.date': 'Datum',
  'protocol.duration': 'Dauer',
  'protocol.minutes': 'Min',
  'protocol.minutesFull': 'Minuten',
  'protocol.sourceLanguage': 'Ausgangssprache',
  'protocol.sourceLangShort': 'Sprache',
  'protocol.listeners': 'Zuhörer',
  'protocol.connection': 'Verbindung',
  'protocol.translations': 'Übersetzungen',
  'protocol.endOfProtocol': 'Ende des Protokolls',
  'protocol.createdWith': 'Erstellt mit',
  'protocol.exportText': 'Text (.txt)',
  'protocol.exportMarkdown': 'Markdown (.md)',
  'protocol.filename': 'protokoll',

  // Footer
  'footer.imprint': 'Impressum',
  'footer.privacy': 'Datenschutz',
  'footer.projectBy': 'Ein Projekt von',

  // Listener view
  'live.sessionEnded': 'Session beendet',
  'live.sessionEndedDesc': 'Der Speaker hat die Live-Übersetzung beendet.',
  'live.back': 'Zurück',
  'live.waitingTranslation': 'Warte auf Übersetzung...',
  'live.speaking': 'Wird vorgelesen...',
  'live.connected': 'Verbunden',
  'live.autoSpeak': 'Auto-Vorlesen',
  'live.subtitles': 'Untertitel',
  'live.originalAudio': 'Live (Original)',
  'live.leave': 'Verlassen',
  'live.fullscreen': 'Vollbild',
  'live.closeFullscreen': 'Vollbild schließen',
  'live.chooseTargetLang': 'Zielsprache wählen',

  // PWA
  'pwa.install': 'App installieren',
  'pwa.installDesc': 'Offline nutzen, schneller starten',

  // Session code
  'live.enterCode': 'Session-Code eingeben',

  // Speaker view
  'live.hotspotInstruction': 'Bitte aktiviere den Persönlichen Hotspot in den Einstellungen',
  'live.bleAutoDiscovery': 'Listener finden diese Session automatisch per Bluetooth',

  // Storage indicator
  'settings.persistentActive': 'Persistent Storage aktiv — Daten werden nicht gelöscht',
  'settings.persistentInactive': 'Daten können vom Browser gelöscht werden.',
  'settings.enableProtection': 'Schutz aktivieren',

  // WiFi QR / Session QR / Connection
  'live.wifiStep': 'Schritt {step}: WLAN verbinden',
  'live.network': 'Netzwerk',
  'live.wifiScanInstruction': 'Listener scannen diesen QR-Code mit der Kamera-App',
  'live.wifiAutoConnect': 'iOS 11+ und Android 10+ verbinden automatisch',
  'live.shareTitle': 'guidetranslator Live-Übersetzung',
  'live.shareText': 'Tritt meiner Live-Übersetzung bei',
  'live.sessionCodeLabel': 'Session-Code',
  'live.qrInstruction': 'Listener scannen den QR-Code oder öffnen den Link im Browser',
  'live.copied': 'Kopiert!',
  'live.copyLink': 'Link kopieren',
  'live.share': 'Teilen',
  'live.connecting': 'Verbindung wird hergestellt...',
  'live.modeBle': 'BLE Direkt',
  'live.modeHotspot': 'Hotspot-Modus',
  'live.modeLocal': 'Lokales Netzwerk',
  'live.modeCloud': 'Cloud',
  'live.btnCloud': 'Cloud',
  'live.btnHotspot': 'Hotspot',
  'live.btnBle': 'BLE',
  'live.btnRouter': 'Router',

  // Q&A feature
  'live.qa.askQuestion': 'Frage stellen',
  'live.qa.placeholder': 'Ihre Frage eingeben...',
  'live.qa.send': 'Senden',
  'live.qa.sent': 'Gesendet ✓',
  'live.qa.inbox': 'Fragen',
  'live.qa.broadcastToAll': 'An alle senden',
  'live.qa.dismiss': 'Verwerfen',
  'live.qa.broadcastedQuestions': 'Fragen vom Moderator',

  // Error boundary
  'error.errorBoundaryTitle': 'Etwas ist schiefgelaufen',
  'error.errorBoundaryDesc': 'Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.',
  'error.retry': 'Erneut versuchen',
  'error.reloadPage': 'Seite neu laden',

  // Errors
  'error.translationFailed': 'Übersetzung fehlgeschlagen',
  'error.connectionLost': 'Verbindung unterbrochen — wird automatisch wiederhergestellt...',
  'error.speechNotSupported': 'Spracheingabe wird von diesem Browser nicht unterstützt',
  'error.ttsFallback': 'Google Cloud TTS nicht verfügbar – Browser-Stimme wird verwendet',
  'error.bleScanFailed': 'BLE-Scan fehlgeschlagen',
  'error.micDenied': 'Mikrofon-Zugriff verweigert.',
  'error.micUnavailable': 'Mikrofon nicht verfügbar.',
  'error.whisperNotLoaded': 'Whisper-Modell nicht geladen. Bitte unter Einstellungen herunterladen.',
  'error.noOfflineTranslation': 'Keine Offline-Übersetzung verfügbar für {src} → {tgt}',
  'error.sttStartFailed': 'Spracheingabe konnte nicht gestartet werden',
  'error.micDeniedHint': 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.',
  'error.micUnavailableHint': 'Mikrofon nicht verfügbar. Bitte prüfen Sie Ihre Geräte-Einstellungen.',
  'error.networkStt': 'Netzwerkfehler bei der Spracherkennung. Bitte prüfen Sie Ihre Internetverbindung.',
  'error.sttGeneric': 'Spracheingabe-Fehler: {error}',
  'error.appleSpeechNotAvailable': 'Apple SpeechAnalyzer ist noch nicht verfügbar. Wird mit der nativen iOS-App freigeschaltet.',
  'error.cloudSttNotAvailable': 'Spracheingabe nicht verfügbar. Bitte Cloud Speech-to-Text API im Google Cloud Console aktivieren.',
  'error.whisperNotAvailable': 'Offline-Spracherkennung nicht verfügbar. Bitte Whisper-Modell unter Einstellungen herunterladen.',
  'error.bluetoothNotEnabled': 'Bluetooth ist nicht aktiviert',

  // Phrase pack metadata
  'phrases.pack.common.name': 'Basis-Phrasen',
  'phrases.pack.common.desc': 'Grundlegende Sätze für jede Reise',
  'phrases.pack.mediterranean.name': 'Mittelmeer-Kreuzfahrt',
  'phrases.pack.mediterranean.desc': 'Sätze für Mittelmeer-Häfen: Italien, Griechenland, Spanien, Frankreich',
  'phrases.pack.nordic.name': 'Nordland-Kreuzfahrt',
  'phrases.pack.nordic.desc': 'Sätze für Skandinavien und Nordland-Häfen',
  'phrases.pack.migrant.name': 'Behörden & Alltag',
  'phrases.pack.migrant.desc': 'Wichtige Sätze für Behörden, Arzt, Wohnung, Arbeit, Schule, Polizei und Alltag',

  // Phrase categories
  'phrases.cat.greeting': 'Begrüßung',
  'phrases.cat.navigation': 'Navigation',
  'phrases.cat.food': 'Essen',
  'phrases.cat.shopping': 'Shopping',
  'phrases.cat.emergency': 'Notfall',
  'phrases.cat.port': 'Hafen',
  'phrases.cat.sightseeing': 'Sightseeing',
  'phrases.cat.localFood': 'Lokales Essen',
  'phrases.cat.beach': 'Strand',
  'phrases.cat.practical': 'Praktisch',
  'phrases.cat.excursions': 'Ausflüge',
  'phrases.cat.authority': 'Behörde',
  'phrases.cat.doctor': 'Arzt',
  'phrases.cat.housing': 'Wohnung',
  'phrases.cat.work': 'Arbeit',
  'phrases.cat.school': 'Schule',
  'phrases.cat.police': 'Polizei',
  'phrases.cat.daily': 'Alltag',

  // Language names (for LanguageSelector)
  'lang.de': 'Deutsch',
  'lang.en': 'Englisch',
  'lang.fr': 'Französisch',
  'lang.es': 'Spanisch',
  'lang.it': 'Italienisch',
  'lang.pt': 'Portugiesisch',
  'lang.nl': 'Niederländisch',
  'lang.pl': 'Polnisch',
  'lang.tr': 'Türkisch',
  'lang.ru': 'Russisch',
  'lang.uk': 'Ukrainisch',
  'lang.ar': 'Arabisch',
  'lang.zh': 'Chinesisch',
  'lang.ja': 'Japanisch',
  'lang.ko': 'Koreanisch',
  'lang.hi': 'Hindi',
  'lang.sv': 'Schwedisch',
  'lang.da': 'Dänisch',
  'lang.cs': 'Tschechisch',
  'lang.ro': 'Rumänisch',
  'lang.el': 'Griechisch',
  'lang.hu': 'Ungarisch',
  'lang.fa': 'Farsi/Dari',
  'lang.ps': 'Paschtu',
  'lang.ku': 'Kurdisch',
  'lang.ti': 'Tigrinya',
  'lang.am': 'Amharisch',
  'lang.so': 'Somali',
  'lang.ur': 'Urdu',
  'lang.bn': 'Bengali',
  'lang.sw': 'Suaheli',
  'lang.sq': 'Albanisch',
  'lang.hr': 'Kroatisch',
  'lang.bg': 'Bulgarisch',
  'lang.sr': 'Serbisch',
  'lang.sk': 'Slowakisch',
  'lang.no': 'Norwegisch',
  'lang.fi': 'Finnisch',
  'lang.th': 'Thailändisch',
  'lang.vi': 'Vietnamesisch',
  'lang.id': 'Indonesisch',
  'lang.ms': 'Malaiisch',
  'lang.fil': 'Filipino',
  'lang.he': 'Hebräisch',
  'lang.ka': 'Georgisch',

  // Provider / TTS labels
  'provider.google': 'Google',
  'provider.offline': 'Offline',
  'provider.cache': 'Cache',
  'provider.libre': 'LibreTranslate',
  'provider.myMemory': 'MyMemory',
  'tts.cloud': '☁ Cloud',
  'tts.browser': '🖥 Browser',

  // Favorites
  'nav.favorites': 'Favoriten',
  'nav.history': 'Verlauf',
  'favorites.title': 'Favoriten',
  'favorites.subtitle': 'Deine gespeicherten Übersetzungen — schneller Zugriff auf wichtige Sätze.',
  'favorites.empty': 'Noch keine Favoriten gespeichert.',
  'favorites.emptyHint': 'Tippe auf den Stern bei einer Übersetzung, um sie hier zu speichern.',
  'favorites.search': 'Favoriten durchsuchen...',
  'favorites.count': 'Favoriten',
  'favorites.clearAll': 'Alle löschen',
  'favorites.remove': 'Favorit entfernen',
  'favorites.add': 'Als Favorit speichern',
  'favorites.noResults': 'Keine Favoriten gefunden.',

  // History Page
  'historyPage.title': 'Übersetzungsverlauf',
  'historyPage.subtitle': 'Alle bisherigen Übersetzungen durchsuchen, filtern und exportieren.',
  'historyPage.search': 'Verlauf durchsuchen...',
  'historyPage.entries': 'Einträge',
  'historyPage.export': 'Exportieren',
  'history.justNow': 'Gerade eben',
  'history.yesterday': 'Gestern',

  // Export / Import
  'export.title': 'Export / Import',
  'export.subtitle': 'Favoriten, Verlauf und Phrasebook als JSON oder CSV exportieren und importieren.',
  'export.favorites': 'Favoriten exportieren',
  'export.history': 'Verlauf exportieren',
  'export.phrasebook': 'Phrasebook exportieren',
  'export.importData': 'Daten importieren',
  'export.importDesc': 'JSON-Datei auswählen, um Favoriten oder Verlauf zu importieren.',
  'export.importSuccess': '{count} Einträge importiert.',
  'export.importError': 'Import fehlgeschlagen. Bitte prüfe das Dateiformat.',
  'export.csv': 'CSV',
  'export.json': 'JSON',
  'export.all': 'Alles exportieren',

  // Pronunciation Guide
  'pronunciation.show': 'Aussprache',
  'pronunciation.hide': 'Aussprache verbergen',
  'pronunciation.romanization': 'Lautschrift',

  // Context Modes
  'context.label': 'Kontext',
  'context.general': 'Allgemein',
  'context.travel': 'Reise',
  'context.medical': 'Medizin',
  'context.legal': 'Recht',
  'context.business': 'Geschäft',
  'context.casual': 'Alltag',

  // Word Alternatives
  'alternatives.title': 'Alternativen',
  'alternatives.show': 'Alternativen anzeigen',
  'alternatives.hide': 'Alternativen verbergen',
  'alternatives.loading': 'Lade Alternativen...',
  'alternatives.none': 'Keine Alternativen gefunden.',

  // Group Sessions
  'group.title': 'Gruppen-Session',
  'group.subtitle': 'Multi-Sprach-Broadcast — ein Speaker, viele Sprachen gleichzeitig.',
  'group.participants': 'Teilnehmer',
  'group.languages': 'Zielsprachen',
  'group.addLanguage': 'Sprache hinzufügen',

  // PWA
  'pwa.ok': 'OK',
  'pwa.dismiss': 'Schließen',
}

// Cache for dynamically loaded locale packs
const loadedLocales: Partial<Record<UILanguage, TranslationStrings>> = {}

// Vite-compatible dynamic import for locale files
const localeImporters: Record<string, () => Promise<{ default: TranslationStrings }>> = {
  en: () => import('./locales/en'),
  ar: () => import('./locales/ar'),
  tr: () => import('./locales/tr'),
  fa: () => import('./locales/fa'),
  uk: () => import('./locales/uk'),
  ru: () => import('./locales/ru'),
  fr: () => import('./locales/fr'),
  es: () => import('./locales/es'),
}

/** Load a locale pack into memory. No-op for 'de' or already-loaded locales. */
export async function loadLocale(lang: UILanguage): Promise<void> {
  if (lang === 'de' || loadedLocales[lang]) return
  const importer = localeImporters[lang]
  if (!importer) return
  try {
    const mod = await importer()
    loadedLocales[lang] = mod.default
  } catch (err) {
    console.warn('[i18n] Failed to load locale:', lang, err)
  }
}

/** Check if a locale is ready (loaded or is default). */
export function isLocaleReady(lang: UILanguage): boolean {
  return lang === 'de' || !!loadedLocales[lang]
}

export function getTranslation(lang: UILanguage, key: string): string {
  return loadedLocales[lang]?.[key] || de[key] || key
}

export function detectBrowserLanguage(): UILanguage {
  const browserLang = navigator.language.split('-')[0]
  const supported = UI_LANGUAGES.map(l => l.code)
  if (supported.includes(browserLang as UILanguage)) {
    return browserLang as UILanguage
  }
  return 'de'
}
