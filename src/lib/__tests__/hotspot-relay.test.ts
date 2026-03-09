import { describe, it, expect } from 'vitest'
import { generateWifiQRString } from '../hotspot-relay'

describe('generateWifiQRString', () => {
  it('generates standard WiFi QR format', () => {
    const qr = generateWifiQRString('MyNetwork', 'secret123')
    expect(qr).toBe('WIFI:T:WPA;S:MyNetwork;P:secret123;;')
  })

  it('escapes semicolons', () => {
    const qr = generateWifiQRString('Net;work', 'pass;word')
    expect(qr).toContain('Net\\;work')
    expect(qr).toContain('pass\\;word')
  })

  it('escapes colons', () => {
    const qr = generateWifiQRString('Net:work', 'p:w')
    expect(qr).toContain('Net\\:work')
    expect(qr).toContain('p\\:w')
  })

  it('escapes backslashes', () => {
    const qr = generateWifiQRString('Net\\work', 'p\\w')
    expect(qr).toContain('Net\\\\work')
    expect(qr).toContain('p\\\\w')
  })

  it('escapes double quotes', () => {
    const qr = generateWifiQRString('Net"work', 'p"w')
    expect(qr).toContain('Net\\"work')
  })

  it('escapes commas', () => {
    const qr = generateWifiQRString('Net,work', 'p,w')
    expect(qr).toContain('Net\\,work')
  })

  it('uses WPA security type', () => {
    const qr = generateWifiQRString('test', 'test')
    expect(qr).toContain('T:WPA')
  })
})
