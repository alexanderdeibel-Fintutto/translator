import { describe, it, expect } from 'vitest'
import { parseSessionFromDeviceName, GT_BLE_PREFIX, GT_SERVICE_UUID } from '../ble-discovery'

describe('BLE Discovery constants', () => {
  it('has GT- prefix', () => {
    expect(GT_BLE_PREFIX).toBe('GT-')
  })

  it('has a valid UUID for service', () => {
    expect(GT_SERVICE_UUID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })
})

describe('parseSessionFromDeviceName', () => {
  it('parses valid GT device names', () => {
    expect(parseSessionFromDeviceName('GT-TR-A3K9')).toBe('TR-A3K9')
    expect(parseSessionFromDeviceName('GT-TR-ZZZZ')).toBe('TR-ZZZZ')
    expect(parseSessionFromDeviceName('GT-TR-2345')).toBe('TR-2345')
  })

  it('returns null for non-GT names', () => {
    expect(parseSessionFromDeviceName('iPhone')).toBeNull()
    expect(parseSessionFromDeviceName('BT-TR-A3K9')).toBeNull()
    expect(parseSessionFromDeviceName('')).toBeNull()
  })

  it('returns null for invalid session code format', () => {
    expect(parseSessionFromDeviceName('GT-INVALID')).toBeNull()
    expect(parseSessionFromDeviceName('GT-TR-A')).toBeNull()
    expect(parseSessionFromDeviceName('GT-TR-ABCDE')).toBeNull() // too long
  })

  it('is case-insensitive for session code', () => {
    expect(parseSessionFromDeviceName('GT-TR-a3k9')).toBe('TR-a3k9')
  })
})
