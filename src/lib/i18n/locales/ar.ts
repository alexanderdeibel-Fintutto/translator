const strings: Record<string, string> = {
  'nav.translator': '\u0627\u0644\u0645\u062a\u0631\u062c\u0645',
  'nav.live': '\u0645\u0628\u0627\u0634\u0631',
  'nav.conversation': '\u0645\u062d\u0627\u062f\u062b\u0629',
  'nav.camera': '\u0643\u0627\u0645\u064a\u0631\u0627',
  'nav.phrasebook': '\u0643\u062a\u0627\u0628 \u0627\u0644\u0639\u0628\u0627\u0631\u0627\u062a',
  'nav.info': '\u0645\u0639\u0644\u0648\u0645\u0627\u062a',
  'nav.settings': '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
  'status.online': '\u0645\u062a\u0635\u0644',
  'status.degraded': '\u063a\u064a\u0631 \u0645\u0633\u062a\u0642\u0631',
  'status.offline': '\u063a\u064a\u0631 \u0645\u062a\u0635\u0644',
  'theme.light': '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d',
  'theme.dark': '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646',
  'lang.select': '\u0627\u062e\u062a\u0631 \u0627\u0644\u0644\u063a\u0629',
  'translator.title': '\u0627\u0644\u0645\u062a\u0631\u062c\u0645',
  'translator.subtitle': '\u062a\u0631\u062c\u0645 \u0627\u0644\u0646\u0635\u0648\u0635 \u0645\u062c\u0627\u0646\u0627\u064b\u060c \u0627\u0633\u062a\u0645\u0639 \u0625\u0644\u064a\u0647\u0627\u060c \u0648\u0623\u0645\u0644\u0647\u0627 \u0628\u0627\u0644\u0635\u0648\u062a. 45 \u0644\u063a\u0629 \u0645\u062a\u0627\u062d\u0629.',
  'translator.languages': '45 \u0644\u063a\u0629',
  'translator.speechInput': '\u0625\u062f\u062e\u0627\u0644 \u0635\u0648\u062a\u064a',
  'translator.instantTranslation': '\u062a\u0631\u062c\u0645\u0629 \u0641\u0648\u0631\u064a\u0629',
  'translator.free': '\u0645\u062c\u0627\u0646\u064a',
  'translator.liveSession': '\u062c\u0644\u0633\u0629 \u0645\u0628\u0627\u0634\u0631\u0629',
  'translator.from': '\u0645\u0646',
  'translator.to': '\u0625\u0644\u0649',
  'translator.auto': '\u062a\u0644\u0642\u0627\u0626\u064a',
  'translator.placeholder': '\u0627\u0643\u062a\u0628 \u0623\u0648 \u062a\u062d\u062f\u062b...',
  'translator.translating': '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0631\u062c\u0645\u0629...',
  'translator.result': '\u0627\u0644\u062a\u0631\u062c\u0645\u0629 \u062a\u0638\u0647\u0631 \u0647\u0646\u0627...',
  'translator.chars': '\u062d\u0631\u0641',
  'translator.recording': '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0633\u062c\u064a\u0644...',
  'translator.copy': '\u0646\u0633\u062e',
  'translator.speak': '\u0627\u0633\u062a\u0645\u0627\u0639',
  'translator.stop': '\u0625\u064a\u0642\u0627\u0641',
  'translator.delete': '\u062d\u0630\u0641',
  'translator.swap': '\u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0644\u063a\u0627\u062a',
  'translator.searchLang': '\u0628\u062d\u062b \u0639\u0646 \u0644\u063a\u0629...',
  'translator.noLangFound': '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0644\u063a\u0629',
  'translator.formal': '\u0631\u0633\u0645\u064a',
  'translator.informal': '\u063a\u064a\u0631 \u0631\u0633\u0645\u064a',
  'translator.shortcutHint': 'Ctrl+Enter = \u0641\u0648\u0631\u064b\u0627 · Esc = \u0645\u0633\u062d',

  'translator.sentence': '\u062c\u0645\u0644\u0629',
  'translator.paragraph': '\u0641\u0642\u0631\u0629',
  'translator.sentenceMode': '\u0648\u0636\u0639 \u0627\u0644\u062c\u0645\u0644\u0629 \u2014 \u062a\u062a\u0631\u062c\u0645 \u0643\u0644 \u062c\u0645\u0644\u0629 \u0641\u0648\u0631\u0627\u064b',
  'translator.paragraphMode': '\u0648\u0636\u0639 \u0627\u0644\u0641\u0642\u0631\u0629 \u2014 \u062a\u062c\u0645\u064a\u0639 \u0627\u0644\u0646\u0635 \u062b\u0645 \u0627\u0644\u062a\u0631\u062c\u0645\u0629 \u0628\u0627\u0644\u0625\u0631\u0633\u0627\u0644',
  'translator.send': '\u0625\u0631\u0633\u0627\u0644 \u0648\u062a\u0631\u062c\u0645\u0629',
  'phrasebook.title': '\u0643\u062a\u0627\u0628 \u0627\u0644\u0639\u0628\u0627\u0631\u0627\u062a',
  'phrasebook.subtitle': '\u0639\u0628\u0627\u0631\u0627\u062a \u0645\u0647\u0645\u0629 \u0644\u0644\u0645\u0643\u0627\u062a\u0628\u060c \u0627\u0644\u0637\u0628\u064a\u0628\u060c \u0627\u0644\u0633\u0643\u0646\u060c \u0627\u0644\u0639\u0645\u0644\u060c \u0627\u0644\u0645\u062f\u0631\u0633\u0629\u060c \u0627\u0644\u0634\u0631\u0637\u0629 \u0648\u0627\u0644\u062d\u064a\u0627\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629.',
  'phrasebook.all': '\u0627\u0644\u0643\u0644',
  'phrasebook.empty': '\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0628\u0627\u0631\u0627\u062a \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.',
  'phrasebook.translateAll': 'ترجمة الكل',
  'phrases.title': '\u0639\u0628\u0627\u0631\u0627\u062a \u0634\u0627\u0626\u0639\u0629',
  'history.title': '\u0633\u062c\u0644 \u0627\u0644\u062a\u0631\u062c\u0645\u0629',
  'history.clear': '\u0645\u0633\u062d \u0627\u0644\u0633\u062c\u0644',
  'history.empty': '\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0631\u062c\u0645\u0627\u062a \u0628\u0639\u062f',
  'live.title': '\u0627\u0644\u062a\u0631\u062c\u0645\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629',
  'live.create': '\u0625\u0646\u0634\u0627\u0621 \u062c\u0644\u0633\u0629',
  'live.join': '\u0627\u0646\u0636\u0645\u0627\u0645',
  'live.startRecording': '\u0628\u062f\u0621 \u0627\u0644\u062a\u0633\u062c\u064a\u0644',
  'live.pause': '\u0625\u064a\u0642\u0627\u0641 \u0645\u0624\u0642\u062a',
  'live.endSession': '\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062c\u0644\u0633\u0629',
  'live.recording': '\u062a\u0633\u062c\u064a\u0644 \u0645\u0628\u0627\u0634\u0631',
  'live.disconnected': '\u0627\u0646\u0642\u0637\u0639 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u2014 \u062c\u0627\u0631\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644...',
  'live.downloadProtocol': '\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u0631\u0648\u062a\u0648\u0643\u0648\u0644',
  'conversation.title': 'محادثة',
  'conversation.subtitle': 'ترجمة وجهاً لوجه لشخصين',
  'conversation.speak': 'تحدث',
  'conversation.you': 'أنت',
  'conversation.other': 'الآخر',
  'conversation.restart': 'إعادة',
  'conversation.translating': 'جاري الترجمة...',
  'camera.title': 'مترجم الكاميرا',
  'camera.subtitle': 'صوّر نصّاً وترجمه فوراً',
  'camera.capture': 'التقاط صورة',
  'camera.gallery': 'من المعرض',
  'camera.extracting': 'جاري التعرف...',
  'camera.extracted': 'النص المعروف',
  'camera.translation': 'الترجمة',
  'camera.hint': 'وجّه الكاميرا نحو لافتة أو قائمة أو مستند',

  // Errors
  'error.offlineNoModel': 'غير متصل — لم يتم تنزيل نموذج لغة لهذا الزوج. انتقل إلى الإعدادات → اللغات غير المتصلة.',
  'error.allProvidersFailed': 'فشلت الترجمة — يرجى المحاولة مرة أخرى.',
  'error.unknown': 'حدث خطأ.',
  'error.cameraNoApiKey': 'ترجمة الكاميرا تحتاج مفتاح Google Cloud API. يرجى التكوين في الإعدادات.',
  'error.cameraOcrFailed': 'فشل التعرف على النص. يرجى المحاولة مرة أخرى.',
  'error.cameraNoText': 'لم يتم اكتشاف نص في الصورة.',

  'notFound.title': 'الصفحة غير موجودة',
  'notFound.description': 'الصفحة المطلوبة غير موجودة أو تم نقلها.',
  'notFound.back': 'رجوع',
  'notFound.home': 'الرئيسية',
  'settings.title': '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
  'settings.subtitle': 'إدارة وضع عدم الاتصال وحزم اللغات والتخزين',
  'settings.network': 'الشبكة',
  'settings.networkOnline': 'متصل — الترجمة السحابية نشطة',
  'settings.networkDegraded': 'اتصال غير مستقر — وضع عدم الاتصال جاهز',
  'settings.networkOffline': 'غير متصل — اللغات المحملة فقط متاحة',
  'settings.storage': 'التخزين',
  'settings.apiKey': 'مفتاح Google Cloud API',
  'settings.apiKeyDesc': 'للترجمة السحابية وTTS والكاميرا OCR. بدائل مجانية بدون مفتاح.',
  'settings.apiKeySave': 'حفظ',
  'settings.apiKeySaved': 'تم الحفظ',
  'settings.apiKeyActive': 'مفتاح API مكوّن — الميزات السحابية نشطة',
  'settings.apiKeyInactive': 'لا يوجد مفتاح API — مزودون مجانيون فقط',
  'settings.offlineLangs': 'اللغات غير المتصلة',
  'settings.offlineLangsDesc': 'حمّل حزم اللغات للترجمة بدون إنترنت (~35 ميغابايت لكل زوج).',
  'settings.whisper': 'الإدخال الصوتي بدون اتصال (Whisper)',
  'settings.whisperDesc': 'Whisper يتيح التعرف على الكلام بدون إنترنت (~40 ميغابايت).',
  'settings.whisperReady': 'نموذج Whisper جاهز',
  'settings.whisperDownload': 'تحميل Whisper (~40 ميغابايت)',
  'settings.cache': 'إدارة الذاكرة المؤقتة',
  'settings.translationCache': 'ذاكرة الترجمة',
  'settings.ttsCache': 'ذاكرة TTS الصوتية',
  'settings.entries': 'إدخالات',
  'settings.audioClips': 'مقاطع صوتية',
  'settings.clear': 'مسح',
  'settings.safariHintTitle': 'نصيحة لمتصفح iOS Safari:',
  'settings.safariHintText': 'أضف هذا التطبيق إلى الشاشة الرئيسية حتى لا يتم حذف بياناتك بعد 7 أيام. اضغط على',
  'settings.safariHintShare': 'مشاركة ↑',
  'settings.safariHintHome': 'إضافة إلى الشاشة الرئيسية',
  'liveLanding.title': 'الوضع المباشر',
  'liveLanding.subtitle': 'ترجم في الوقت الفعلي لجمهور أو استمع كمستمع.',
  'liveLanding.speaker': 'المتحدث',
  'liveLanding.createSession': 'إنشاء جلسة',
  'liveLanding.speakerDesc': 'ابدأ جلسة مباشرة وترجم في الوقت الفعلي لجمهورك.',
  'liveLanding.iSpeak': 'أتحدث',
  'liveLanding.connection': 'الاتصال',
  'liveLanding.mobileOnly': 'متاح فقط على الأجهزة المحمولة',
  'liveLanding.hotspotTitle': 'وضع نقطة الاتصال',
  'liveLanding.hotspotAutoDesc': 'جهازك ينشئ تلقائيًا نقطة اتصال WiFi. يتصل المستمعون مباشرة.',
  'liveLanding.hotspotManualDesc': 'أنشئ نقطة اتصال يدويًا. يتصل المستمعون بشبكة WiFi الخاصة بك.',
  'liveLanding.hotspotLimit': 'يعمل بالكامل بدون إنترنت',
  'liveLanding.bleTitle': 'بلوتوث LE مباشر',
  'liveLanding.bleDesc': 'اتصال عبر بلوتوث منخفض الطاقة. لا حاجة لـ WiFi.',
  'liveLanding.bleLimit': 'المدى: حوالي 10-30 متر',
  'liveLanding.relayAddress': 'عنوان خادم الترحيل',
  'liveLanding.relayAddressHint': 'عنوان خادم الترحيل على جهاز WiFi المحمول',
  'liveLanding.startSession': 'بدء الجلسة',
  'liveLanding.listener': 'المستمع',
  'liveLanding.joinSession': 'الانضمام إلى جلسة',
  'liveLanding.listenerDesc': 'امسح رمز QR الخاص بالمتحدث أو أدخل رمز الجلسة.',
  'liveLanding.nearbySessions': 'جلسات قريبة',
  'liveLanding.join': 'انضمام',
  'liveLanding.scanning': 'البحث عن جلسات قريبة...',
  'liveSession.joining': 'الانضمام إلى جلسة',
  'liveSession.bleDirect': 'BLE مباشر (بدون إنترنت)',
  'liveSession.localNetwork': 'شبكة محلية (وضع بدون إنترنت)',
  'liveSession.cloudConnection': 'اتصال سحابي',
  'liveSession.chooseLanguage': 'بأي لغة تريد الاستماع؟',
  'liveSession.join': 'انضمام',
  'info.about': 'حول',
  'info.subtitle': 'تطبيق الترجمة الوحيد مع بث مباشر لعدد غير محدود من المستمعين — بالكامل بدون إنترنت.',
  'info.version': '54 زوج لغات بدون إنترنت، 4 طبقات نقل، تشفير E2E',
  'info.supportedLangs': 'اللغات المدعومة',
  'info.supportedLangsDesc': 'لغة مدعومة. 54 زوج لغات بدون إنترنت عبر Opus-MT (حوالي 35 ميجابايت لكل زوج).',
  'info.transportTitle': 'بنية النقل',
  'info.transportDesc': '4 طبقات نقل لأقصى توفر — لا يوفر أي مترجم آخر هذا.',
  'info.transport1Title': '1. السحابة (Supabase)',
  'info.transport1Desc': 'بث في الوقت الفعلي عبر WebSocket. مدى غير محدود.',
  'info.transport2Title': '2. WiFi محلي',
  'info.transport2Desc': 'ترحيل WebSocket في الشبكة المحلية. لا حاجة للإنترنت.',
  'info.transport3Title': '3. نقطة اتصال',
  'info.transport3Desc': 'هاتف المتحدث ينشئ WiFi خاص + خادم ترحيل.',
  'info.transport4Title': '4. بلوتوث LE',
  'info.transport4Desc': 'خادم/عميل GATT. يعمل بالكامل بدون شبكة.',
  'info.ecosystemTitle': 'جزء من منظومة ai tour',
  'info.ecosystemDesc': 'guidetranslator جزء من منصة ai tour للمالية والعقارات والإدارة.',
  'info.feature1Title': '54+ زوج لغات بدون إنترنت',
  'info.feature1Desc': 'ترجم بين 40+ لغة — من الألمانية إلى العربية والصينية واليابانية والكورية والهندية وغيرها.',
  'info.feature2Title': 'جلسات مباشرة (1→N)',
  'info.feature2Desc': 'متحدث واحد يتحدث، مستمعون غير محدودين يسمعون الترجمة بلغتهم.',
  'info.feature3Title': 'وضع المحادثة',
  'info.feature3Desc': 'ترجمة وجهاً لوجه: شخصان يتحدثان بالتناوب. مثالي لزيارات الطبيب.',
  'info.feature4Title': 'مترجم الكاميرا',
  'info.feature4Desc': 'صوّر اللافتات أو القوائم أو المستندات — يتم التعرف على النص وترجمته فوراً.',
  'info.feature5Title': 'ترجمات فورية',
  'info.feature5Desc': 'يرى المستمعون الترجمات كعناوين فرعية في الوقت الفعلي — بما في ذلك وضع ملء الشاشة.',
  'info.feature6Title': 'إدخال صوتي (متصل + بدون إنترنت)',
  'info.feature6Desc': 'Web Speech API لـ Chrome/Edge، نموذج Whisper (~40 ميجابايت) لـ STT بدون إنترنت.',
  'info.feature7Title': 'تحويل نص لكلام HD',
  'info.feature7Desc': 'Google Cloud TTS مع أصوات Neural2 و Chirp 3 HD. تخزين مؤقت تلقائي.',
  'info.feature8Title': 'نظام 4 مستويات بدون إنترنت',
  'info.feature8Desc': 'سحابة → WiFi محلي → نقطة اتصال → بلوتوث LE. يعمل حتى بدون إنترنت.',
  'info.feature9Title': 'تشفير E2E',
  'info.feature9Desc': 'تشفير AES-256-GCM لجميع عمليات النقل المحلية. لا يرى أي خادم ترجماتك.',
  'info.feature10Title': 'كشف اللغة تلقائياً',
  'info.feature10Desc': 'يكتشف تلقائياً لغة المصدر باستخدام تحليل Unicode — بالكامل بدون إنترنت.',
  'info.feature11Title': 'تصدير بروتوكول الجلسة',
  'info.feature11Desc': 'حمّل نسخة كاملة كنص أو Markdown.',
  'info.feature12Title': 'مجاني ومفتوح المصدر',
  'info.feature12Desc': 'بدون تكلفة لكل مستمع أو دقيقة. تثبيت PWA للوصول السريع بدون إنترنت.',
  'footer.imprint': '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0631',
  'footer.privacy': '\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a',

  // Listener view
  'live.sessionEnded': 'انتهت الجلسة',
  'live.sessionEndedDesc': 'أنهى المتحدث الترجمة المباشرة.',
  'live.back': 'رجوع',
  'live.waitingTranslation': 'في انتظار الترجمة...',
  'live.speaking': 'جارٍ القراءة...',
  'live.connected': 'متصل',
  'live.autoSpeak': 'قراءة تلقائية',
  'live.subtitles': 'ترجمات',
  'live.leave': 'مغادرة',
  'live.fullscreen': 'ملء الشاشة',
  'live.closeFullscreen': 'إغلاق ملء الشاشة',
  'live.chooseTargetLang': 'اختر لغة الهدف',
  'live.enterCode': 'أدخل رمز الجلسة',

  // Speaker view
  'live.hotspotInstruction': 'يرجى تفعيل نقطة الاتصال الشخصية في الإعدادات',
  'live.bleAutoDiscovery': 'يجد المستمعون هذه الجلسة تلقائياً عبر البلوتوث',

  // PWA
  'pwa.install': 'تثبيت التطبيق',
  'pwa.installDesc': 'استخدم بدون إنترنت، بدء أسرع',

  // Error boundary
  'error.errorBoundaryTitle': 'حدث خطأ ما',
  'error.errorBoundaryDesc': 'حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.',
  'error.retry': 'حاول مرة أخرى',
  'error.reloadPage': 'إعادة تحميل الصفحة',
  'error.translationFailed': 'فشلت الترجمة',
  'error.connectionLost': 'انقطع الاتصال — تتم إعادة الاتصال تلقائياً...',

  // Layout
  'layout.skipToContent': 'انتقل إلى المحتوى',

  // Header
  'header.homeAriaLabel': 'guidetranslator — الصفحة الرئيسية',
  'header.menuClose': 'إغلاق القائمة',
  'header.menuOpen': 'فتح القائمة',

  // Footer
  'footer.projectBy': 'مشروع من',

  // Translator
  'translator.micUnavailable': 'الإدخال الصوتي غير متاح. يرجى التحقق من إعدادات المتصفح واتصال الإنترنت.',
  'translator.autoDetect': 'كشف اللغة تلقائياً',
  'translator.autoSpeakOn': 'القراءة التلقائية مفعّلة',
  'translator.autoSpeakOff': 'القراءة التلقائية معطّلة',
  'translator.hdVoiceOn': 'صوت HD مفعّل (Chirp 3 HD)',
  'translator.sdVoice': 'صوت قياسي (Neural2)',
  'translator.formalityHint': 'الرسمية — غيّر لغة الهدف إلى DE، FR، ES...',
  'translator.micNotAvailable': 'الإدخال الصوتي غير متاح',
  'translator.stopRecording': 'إيقاف التسجيل',
  'translator.share': 'مشاركة',
  'translator.goodTranslation': 'ترجمة جيدة',
  'translator.badTranslation': 'ترجمة سيئة',

  // Live
  'live.listenersConnected': 'مستمعون متصلون',
  'live.waitingForListeners': 'في انتظار المستمعين... شارك رمز QR أو الرابط.',
  'live.waitingForSpeaker': 'في انتظار الترجمات من المتحدث...',
  'live.startToTranslate': 'ابدأ التسجيل للترجمة...',

  // Conversation
  'conversation.stop': 'إيقاف',
  'conversation.person1': 'شخص 1',
  'conversation.person2': 'شخص 2',

  // Settings
  'settings.ready': 'جاهز',
  'settings.deleteLanguagePack': 'حذف حزمة اللغة',
  'settings.downloadPack': 'تحميل',

  // Storage indicator
  'settings.persistentActive': 'التخزين الدائم مفعّل — لن يتم حذف البيانات',
  'settings.persistentInactive': 'قد يحذف المتصفح البيانات.',
  'settings.enableProtection': 'تفعيل الحماية',

  // WiFi QR / Session QR / Connection
  'live.wifiStep': 'الخطوة {step}: الاتصال بالواي فاي',
  'live.network': 'الشبكة',
  'live.wifiScanInstruction': 'يمسح المستمعون رمز QR بتطبيق الكاميرا',
  'live.wifiAutoConnect': 'iOS 11+ و Android 10+ يتصلان تلقائياً',
  'live.shareTitle': 'guidetranslator ترجمة مباشرة',
  'live.shareText': 'انضم إلى ترجمتي المباشرة',
  'live.sessionCodeLabel': 'رمز الجلسة',
  'live.qrInstruction': 'يمسح المستمعون رمز QR أو يفتحون الرابط في المتصفح',
  'live.copied': 'تم النسخ!',
  'live.copyLink': 'نسخ الرابط',
  'live.share': 'مشاركة',
  'live.connecting': 'جارٍ الاتصال...',
  'live.modeBle': 'BLE مباشر',
  'live.modeHotspot': 'وضع نقطة الاتصال',
  'live.modeLocal': 'شبكة محلية',
  'live.modeCloud': 'سحابة',
  'live.btnCloud': 'سحابة',
  'live.btnHotspot': 'نقطة اتصال',
  'live.btnBle': 'BLE',
  'live.btnRouter': 'راوتر',

  // Errors (hooks & lib)
  'error.speechNotSupported': 'الإدخال الصوتي غير مدعوم في هذا المتصفح',
  'error.ttsFallback': 'Google Cloud TTS غير متاح — يتم استخدام صوت المتصفح',
  'error.bleScanFailed': 'فشل فحص BLE',
  'error.micDenied': 'تم رفض الوصول إلى الميكروفون.',
  'error.micUnavailable': 'الميكروفون غير متاح.',
  'error.whisperNotLoaded': 'نموذج Whisper غير محمّل. يرجى التحميل من الإعدادات.',
  'error.noOfflineTranslation': 'لا تتوفر ترجمة بدون اتصال لـ {src} → {tgt}',
  'error.sttStartFailed': 'تعذر بدء الإدخال الصوتي',

  // Header / Protocol
  'nav.mainNavigation': 'التنقل الرئيسي',
  'protocol.title': 'بروتوكول الجلسة',
  'protocol.field': 'الحقل',
  'protocol.value': 'القيمة',
  'protocol.session': 'الجلسة',
  'protocol.date': 'التاريخ',
  'protocol.duration': 'المدة',
  'protocol.minutes': 'دقيقة',
  'protocol.minutesFull': 'دقائق',
  'protocol.sourceLanguage': 'لغة المصدر',
  'protocol.sourceLangShort': 'اللغة',
  'protocol.listeners': 'المستمعون',
  'protocol.connection': 'الاتصال',
  'protocol.translations': 'الترجمات',
  'protocol.endOfProtocol': 'نهاية البروتوكول',
  'protocol.createdWith': 'تم الإنشاء بواسطة',
  'protocol.exportText': 'Text (.txt)',
  'protocol.exportMarkdown': 'Markdown (.md)',
  'protocol.filename': 'protocol',

  // Error messages (stt.ts)
  'error.micDeniedHint': 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.',
  'error.micUnavailableHint': 'الميكروفون غير متاح. يرجى التحقق من إعدادات الجهاز.',
  'error.networkStt': 'خطأ في الشبكة أثناء التعرف على الكلام. يرجى التحقق من اتصال الإنترنت.',
  'error.sttGeneric': 'خطأ في الإدخال الصوتي: {error}',
  'error.appleSpeechNotAvailable': 'Apple SpeechAnalyzer غير متاح بعد. سيتم تفعيله مع تطبيق iOS الأصلي.',
  'error.cloudSttNotAvailable': 'الإدخال الصوتي غير متاح. يرجى تفعيل Cloud Speech-to-Text API في Google Cloud Console.',
  'error.whisperNotAvailable': 'التعرف على الكلام بدون اتصال غير متاح. يرجى تنزيل نموذج Whisper من الإعدادات.',
  'error.bluetoothNotEnabled': 'البلوتوث غير مفعّل',

  // Phrase pack metadata
  'phrases.pack.common.name': 'عبارات أساسية',
  'phrases.pack.common.desc': 'جمل أساسية لكل رحلة',
  'phrases.pack.mediterranean.name': 'رحلة البحر المتوسط',
  'phrases.pack.mediterranean.desc': 'عبارات لموانئ البحر المتوسط: إيطاليا، اليونان، إسبانيا، فرنسا',
  'phrases.pack.nordic.name': 'رحلة الشمال',
  'phrases.pack.nordic.desc': 'عبارات لموانئ الدول الاسكندنافية والشمالية',
  'phrases.pack.migrant.name': 'السلطات والحياة اليومية',
  'phrases.pack.migrant.desc': 'عبارات مهمة للسلطات والأطباء والسكن والعمل والمدرسة والشرطة والحياة اليومية',

  // Phrase categories
  'phrases.cat.greeting': 'التحية',
  'phrases.cat.navigation': 'التنقل',
  'phrases.cat.food': 'الطعام',
  'phrases.cat.shopping': 'التسوق',
  'phrases.cat.emergency': 'الطوارئ',
  'phrases.cat.port': 'الميناء',
  'phrases.cat.sightseeing': 'المعالم السياحية',
  'phrases.cat.localFood': 'الطعام المحلي',
  'phrases.cat.beach': 'الشاطئ',
  'phrases.cat.practical': 'عملي',
  'phrases.cat.excursions': 'رحلات',
  'phrases.cat.authority': 'السلطات',
  'phrases.cat.doctor': 'الطبيب',
  'phrases.cat.housing': 'السكن',
  'phrases.cat.work': 'العمل',
  'phrases.cat.school': 'المدرسة',
  'phrases.cat.police': 'الشرطة',
  'phrases.cat.daily': 'الحياة اليومية',

  // Language names
  'lang.de': 'ألمانية', 'lang.en': 'إنجليزية', 'lang.fr': 'فرنسية', 'lang.es': 'إسبانية',
  'lang.it': 'إيطالية', 'lang.pt': 'برتغالية', 'lang.nl': 'هولندية', 'lang.pl': 'بولندية',
  'lang.tr': 'تركية', 'lang.ru': 'روسية', 'lang.uk': 'أوكرانية', 'lang.ar': 'عربية',
  'lang.zh': 'صينية', 'lang.ja': 'يابانية', 'lang.ko': 'كورية', 'lang.hi': 'هندية',
  'lang.sv': 'سويدية', 'lang.da': 'دنماركية', 'lang.cs': 'تشيكية', 'lang.ro': 'رومانية',
  'lang.el': 'يونانية', 'lang.hu': 'مجرية', 'lang.fa': 'فارسية/دارية', 'lang.ps': 'بشتو',
  'lang.ku': 'كردية', 'lang.ti': 'تيغرينية', 'lang.am': 'أمهرية', 'lang.so': 'صومالية',
  'lang.ur': 'أردية', 'lang.bn': 'بنغالية', 'lang.sw': 'سواحيلية', 'lang.sq': 'ألبانية',
  'lang.hr': 'كرواتية', 'lang.bg': 'بلغارية', 'lang.sr': 'صربية', 'lang.sk': 'سلوفاكية',
  'lang.no': 'نرويجية', 'lang.fi': 'فنلندية', 'lang.th': 'تايلندية', 'lang.vi': 'فيتنامية',
  'lang.id': 'إندونيسية', 'lang.ms': 'ملايوية', 'lang.fil': 'فلبينية', 'lang.he': 'عبرية',
  'lang.ka': 'جورجية',

  // Provider / TTS / PWA
  'provider.google': 'Google', 'provider.offline': 'غير متصل', 'provider.cache': 'ذاكرة مؤقتة',
  'provider.libre': 'LibreTranslate', 'provider.myMemory': 'MyMemory',
  'tts.cloud': '☁ سحابي', 'tts.browser': '🖥 المتصفح',
  'pwa.ok': 'موافق', 'pwa.dismiss': 'إغلاق',
}

export default strings
