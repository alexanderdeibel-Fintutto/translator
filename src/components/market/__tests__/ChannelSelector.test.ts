import { describe, it, expect } from 'vitest'
import type { Channel } from '../ChannelSelector'

describe('ChannelSelector data model', () => {
  it('should support live and offline channels', () => {
    const channels: Channel[] = [
      { id: 'main', name: 'Hauptbuehne', sourceLang: 'de', listenerCount: 42, isLive: true, speakerName: 'Dr. Mueller' },
      { id: 'room-b', name: 'Raum B', sourceLang: 'en', listenerCount: 0, isLive: false },
    ]

    const liveChannels = channels.filter((c) => c.isLive)
    const offlineChannels = channels.filter((c) => !c.isLive)

    expect(liveChannels.length).toBe(1)
    expect(offlineChannels.length).toBe(1)
    expect(liveChannels[0].listenerCount).toBeGreaterThan(0)
  })

  it('should have unique channel IDs', () => {
    const channels: Channel[] = [
      { id: 'ch1', name: 'A', sourceLang: 'de', listenerCount: 0, isLive: true },
      { id: 'ch2', name: 'B', sourceLang: 'en', listenerCount: 0, isLive: true },
      { id: 'ch3', name: 'C', sourceLang: 'fr', listenerCount: 0, isLive: false },
    ]

    const ids = channels.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should support optional fields', () => {
    const minimal: Channel = {
      id: 'test',
      name: 'Test',
      sourceLang: 'de',
      listenerCount: 0,
      isLive: false,
    }

    expect(minimal.speakerName).toBeUndefined()
    expect(minimal.topic).toBeUndefined()

    const full: Channel = {
      id: 'test2',
      name: 'Full',
      sourceLang: 'en',
      listenerCount: 100,
      isLive: true,
      speakerName: 'Speaker',
      topic: 'Keynote',
    }

    expect(full.speakerName).toBe('Speaker')
    expect(full.topic).toBe('Keynote')
  })

  it('should handle large listener counts', () => {
    const channel: Channel = {
      id: 'big',
      name: 'Hauptsaal',
      sourceLang: 'de',
      listenerCount: 500,
      isLive: true,
    }

    expect(channel.listenerCount).toBe(500)
  })
})
