/**
 * ChannelSelector — Multi-channel system for conferences/events
 *
 * Allows listeners to switch between multiple active speaker channels.
 * Each channel has its own speaker, language, and topic.
 */

import { useState } from 'react'
import { Radio, Mic, Users, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getLanguageByCode } from '@/lib/languages'

export interface Channel {
  id: string
  name: string
  speakerName?: string
  sourceLang: string
  listenerCount: number
  isLive: boolean
  topic?: string
}

interface ChannelSelectorProps {
  channels: Channel[]
  activeChannelId: string | null
  onSelect: (channelId: string) => void
  className?: string
}

export default function ChannelSelector({
  channels,
  activeChannelId,
  onSelect,
  className = '',
}: ChannelSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
        <Radio className="h-4 w-4" />
        Kanaele ({channels.filter((c) => c.isLive).length} live)
      </h3>

      <div className="space-y-1.5">
        {channels.map((channel) => {
          const isActive = activeChannelId === channel.id
          const langData = getLanguageByCode(channel.sourceLang)

          return (
            <Card
              key={channel.id}
              className={`p-3 cursor-pointer transition-all ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : channel.isLive
                  ? 'hover:bg-accent'
                  : 'opacity-50'
              }`}
              onClick={() => channel.isLive && onSelect(channel.id)}
            >
              <div className="flex items-center gap-3">
                {/* Live indicator */}
                <div className="shrink-0">
                  {channel.isLive ? (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/30 inline-block" />
                  )}
                </div>

                {/* Channel info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{channel.name}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {channel.speakerName && (
                      <span className="flex items-center gap-1">
                        <Mic className="h-3 w-3" />
                        {channel.speakerName}
                      </span>
                    )}
                    <span>{langData?.flag} {langData?.name || channel.sourceLang}</span>
                    {channel.topic && (
                      <span className="truncate">— {channel.topic}</span>
                    )}
                  </div>
                </div>

                {/* Listener count */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Users className="h-3 w-3" />
                  {channel.listenerCount}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {channels.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          Noch keine Kanaele aktiv
        </p>
      )}
    </div>
  )
}
