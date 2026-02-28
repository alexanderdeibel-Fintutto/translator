import { describe, it, expect } from 'vitest'
import { detectLanguage } from '../detect-language'

describe('detectLanguage', () => {
  // --- Edge cases ---
  it('returns null for empty input', () => {
    expect(detectLanguage('')).toBeNull()
    expect(detectLanguage('  ')).toBeNull()
  })

  it('returns null for very short input', () => {
    expect(detectLanguage('hi')).toBeNull()
  })

  // --- Script-based detection (non-Latin) ---
  it('detects Arabic script', () => {
    const result = detectLanguage('مرحبا بكم في الموقع')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('ar')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Cyrillic as Russian', () => {
    const result = detectLanguage('Привет мир, как дела')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('ru')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Chinese characters', () => {
    const result = detectLanguage('你好世界，欢迎来到')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('zh')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Japanese hiragana/katakana', () => {
    const result = detectLanguage('こんにちは、ようこそ おはようございます')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('ja')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Korean hangul', () => {
    const result = detectLanguage('안녕하세요 세계에 오신 것을')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('ko')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Thai script', () => {
    const result = detectLanguage('สวัสดีครับ ยินดีต้อนรับ')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('th')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Hebrew script', () => {
    const result = detectLanguage('שלום עולם ברוכים הבאים')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('he')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('detects Hindi/Devanagari', () => {
    const result = detectLanguage('नमस्ते दुनिया में आपका स्वागत')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('hi')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.8)
  })

  // --- Word-frequency-based detection (Latin scripts) ---
  it('detects German text', () => {
    const result = detectLanguage('Das ist ein Test und wir werden sehen ob es funktioniert')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('de')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects English text', () => {
    const result = detectLanguage('This is a test and we will see if it works correctly for the detection')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('en')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects French text', () => {
    const result = detectLanguage('Les enfants sont dans une école pour apprendre avec nous')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('fr')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects Spanish text', () => {
    const result = detectLanguage('Los niños están en una escuela para aprender con nosotros')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('es')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects Italian text', () => {
    const result = detectLanguage('Questo è un testo per verificare che la funzione di rilevamento della lingua funziona')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('it')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects Turkish text', () => {
    const result = detectLanguage('Bu bir deneme ve nasıl çalıştığını göreceğiz')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('tr')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  it('detects Dutch text', () => {
    const result = detectLanguage('Het is een test en we zullen zien of het werkt voor de detectie van het Nederlands')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('nl')
    expect(result!.confidence).toBeGreaterThanOrEqual(0.3)
  })

  it('detects Polish text', () => {
    const result = detectLanguage('To jest test i zobaczymy czy nie będzie problemów przez tego')
    expect(result).not.toBeNull()
    expect(result!.language).toBe('pl')
    expect(result!.confidence).toBeGreaterThan(0.3)
  })

  // --- Confidence handling ---
  it('has lower confidence for ambiguous short text', () => {
    const result = detectLanguage('the cat')
    // Very short — might return null or low confidence
    if (result) {
      expect(result.confidence).toBeLessThan(0.9)
    }
  })

  it('confidence never exceeds 0.95', () => {
    const result = detectLanguage('Das ist ein sehr langer deutscher Text und wir werden sehen ob die Konfidenz richtig berechnet wird')
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeLessThanOrEqual(0.95)
  })
})
