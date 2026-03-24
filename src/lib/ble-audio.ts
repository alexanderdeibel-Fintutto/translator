// BLE Audio Streaming for offline guide scenarios
// Broadcasts translated audio over Bluetooth Low Energy

export interface BleAudioConfig {
  serviceUuid: string
  characteristicUuid: string
  chunkSize?: number // default 512 bytes
}

const DEFAULT_CONFIG: BleAudioConfig = {
  serviceUuid: '0000ffe0-0000-1000-8000-00805f9b34fb',
  characteristicUuid: '0000ffe1-0000-1000-8000-00805f9b34fb',
  chunkSize: 512,
}

export function isBleAudioSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export async function startBleAudioBroadcast(
  audioData: ArrayBuffer,
  config: Partial<BleAudioConfig> = {},
): Promise<{ bytesTransferred: number; durationMs: number }> {
  if (!isBleAudioSupported()) {
    throw new Error('Web Bluetooth API not available in this browser.')
  }

  const cfg = { ...DEFAULT_CONFIG, ...config }
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [cfg.serviceUuid] }],
  })

  const server = await device.gatt!.connect()
  const service = await server.getPrimaryService(cfg.serviceUuid)
  const characteristic = await service.getCharacteristic(cfg.characteristicUuid)

  const totalBytes = audioData.byteLength
  const chunks = Math.ceil(totalBytes / cfg.chunkSize!)
  const startTime = Date.now()

  for (let i = 0; i < chunks; i++) {
    const start = i * cfg.chunkSize!
    const end = Math.min(start + cfg.chunkSize!, totalBytes)
    const chunk = new Uint8Array(audioData.slice(start, end))
    await characteristic.writeValueWithResponse(chunk)
  }

  server.disconnect()
  return { bytesTransferred: totalBytes, durationMs: Date.now() - startTime }
}

export function estimateBleTransferTime(audioSizeBytes: number, chunkSize = 512): number {
  // BLE 4.2: ~1.4 Mbit/s practical throughput, ~175 KB/s
  // With overhead: ~100 KB/s
  return (audioSizeBytes / (100 * 1024)) * 1000
}
