// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'

import { generateQrSvg, generateQrDataUrl, generateQrBlob, batchGenerateQr } from '../qr-generator'

describe('generateQrSvg', () => {
  it('returns a valid SVG string', () => {
    const svg = generateQrSvg('https://example.com')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('includes the data text (truncated) in the SVG', () => {
    const svg = generateQrSvg('https://example.com')
    expect(svg).toContain('https://example.com')
  })

  it('uses default options when none provided', () => {
    const svg = generateQrSvg('test')
    expect(svg).toContain('width="256"')
    expect(svg).toContain('height="256"')
    expect(svg).toContain('#ffffff') // default light color
    expect(svg).toContain('#000000') // default dark color
  })

  it('respects custom size option', () => {
    const svg = generateQrSvg('test', { size: 512 })
    expect(svg).toContain('width="512"')
    expect(svg).toContain('height="512"')
  })

  it('respects custom color options', () => {
    const svg = generateQrSvg('test', { darkColor: '#ff0000', lightColor: '#00ff00' })
    expect(svg).toContain('#ff0000')
    expect(svg).toContain('#00ff00')
  })

  it('truncates long data in display', () => {
    const longData = 'a'.repeat(100)
    const svg = generateQrSvg(longData)
    // Should truncate to 30 chars in the text element
    expect(svg).toContain(longData.slice(0, 30))
    expect(svg).not.toContain(longData)
  })

  it('handles empty string input', () => {
    const svg = generateQrSvg('')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})

describe('generateQrDataUrl', () => {
  it('returns a data URL with SVG MIME type', () => {
    const dataUrl = generateQrDataUrl('https://example.com')
    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/)
  })

  it('contains encoded SVG content', () => {
    const dataUrl = generateQrDataUrl('test')
    const decoded = decodeURIComponent(dataUrl.split(',')[1])
    expect(decoded).toContain('<svg')
    expect(decoded).toContain('</svg>')
  })

  it('respects options passed through', () => {
    const dataUrl = generateQrDataUrl('test', { size: 128 })
    const decoded = decodeURIComponent(dataUrl.split(',')[1])
    expect(decoded).toContain('width="128"')
  })
})

describe('generateQrBlob', () => {
  it('returns a Blob with SVG MIME type', () => {
    const blob = generateQrBlob('https://example.com')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/svg+xml')
  })

  it('blob has non-zero size', () => {
    const blob = generateQrBlob('test')
    expect(blob.size).toBeGreaterThan(0)
  })
})

describe('batchGenerateQr', () => {
  it('returns array of QR results matching input items', () => {
    const items = [
      { id: '1', url: 'https://a.com', label: 'A' },
      { id: '2', url: 'https://b.com', label: 'B' },
    ]
    const results = batchGenerateQr(items)
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('1')
    expect(results[0].label).toBe('A')
    expect(results[1].id).toBe('2')
    expect(results[1].label).toBe('B')
  })

  it('each result has svg and dataUrl properties', () => {
    const items = [{ id: '1', url: 'https://example.com', label: 'Test' }]
    const results = batchGenerateQr(items)
    expect(results[0].svg).toContain('<svg')
    expect(results[0].dataUrl).toMatch(/^data:image\/svg\+xml/)
  })

  it('passes options to each QR generation', () => {
    const items = [{ id: '1', url: 'https://example.com', label: 'Test' }]
    const results = batchGenerateQr(items, { size: 64 })
    expect(results[0].svg).toContain('width="64"')
  })

  it('returns empty array for empty input', () => {
    const results = batchGenerateQr([])
    expect(results).toEqual([])
  })
})
