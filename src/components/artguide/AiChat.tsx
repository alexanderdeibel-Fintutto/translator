import React, { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Artwork, VisitorProfile, PersonalizationContext } from '@/lib/artguide/types'
import { buildPersonalizationContext } from '@/lib/artguide/ai-service'

interface AiChatProps {
  artwork: Artwork
  visitor: VisitorProfile
  className?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * AI Chat component — visitors can ask questions about an artwork.
 * Uses the artguide-ai Edge Function for Claude-powered responses.
 * Adapts tone and depth based on visitor profile.
 */
export function AiChat({ artwork, visitor, className = '' }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load existing chat from database
  useEffect(() => {
    if (!visitor.id || !artwork.id) return
    loadExistingChat()
  }, [visitor.id, artwork.id])

  async function loadExistingChat() {
    try {
      const { data } = await supabase
        .from('ag_ai_chats')
        .select('messages')
        .eq('visitor_id', visitor.id)
        .eq('artwork_id', artwork.id)
        .single()

      if (data?.messages) {
        setMessages(data.messages as ChatMessage[])
      }
    } catch {
      // No existing chat
    }
  }

  const sendMessage = useCallback(async () => {
    const question = input.trim()
    if (!question || isLoading) return

    setInput('')
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const context = buildPersonalizationContext(visitor)

      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: {
          action: 'chat',
          artwork_id: artwork.id,
          visitor_id: visitor.id,
          question,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          personalization: context,
          language: visitor.language,
        },
      })

      if (error) throw error

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('[AiChat] Error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Es tut mir leid, es gab einen Fehler. Bitte versuche es nochmal.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, artwork, visitor])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Suggested questions based on artwork
  const suggestedQuestions = getSuggestedQuestions(artwork, visitor)

  return (
    <div className={className}>
      {/* Toggle button */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
          if (!isExpanded) setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-400/20 to-indigo-400/20 border border-amber-400/30 flex items-center gap-3 hover:from-amber-400/30 hover:to-indigo-400/30 transition"
      >
        <span className="text-2xl">💬</span>
        <div className="text-left flex-1">
          <div className="font-medium text-white">Frag mich etwas</div>
          <div className="text-sm text-white/50">
            {messages.length > 0
              ? `${messages.length} Nachrichten`
              : 'KI-Chat ueber dieses Kunstwerk'}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Chat panel */}
      {isExpanded && (
        <div className="mt-3 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {/* Messages */}
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <span className="text-3xl block mb-2">🤖</span>
                <p className="text-white/40 text-sm">
                  {visitor.age_group === 'child'
                    ? 'Frag mich was ueber dieses Bild! Ich erklaere es dir gerne.'
                    : 'Stellen Sie mir eine Frage zu diesem Kunstwerk.'}
                </p>

                {/* Suggested questions */}
                <div className="mt-4 space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q)
                        setTimeout(() => sendMessage(), 50)
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-400 text-indigo-950 rounded-br-md'
                      : 'bg-white/10 text-white/90 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                visitor.age_group === 'child'
                  ? 'Was moechtest du wissen?'
                  : 'Ihre Frage zu diesem Werk...'
              }
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-sm"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-amber-400 text-indigo-950 font-medium text-sm disabled:opacity-50 hover:bg-amber-300 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Generate context-appropriate suggested questions based on artwork and visitor profile
 */
function getSuggestedQuestions(artwork: Artwork, visitor: VisitorProfile): string[] {
  const questions: string[] = []

  if (visitor.age_group === 'child') {
    questions.push('Was zeigt das Bild?')
    if (artwork.artist_name) questions.push(`Wer war ${artwork.artist_name}?`)
    questions.push('Warum ist das Bild berühmt?')
  } else if (visitor.age_group === 'youth') {
    questions.push('Was ist das Besondere an diesem Werk?')
    questions.push('Gibt es eine coole Geschichte dahinter?')
    if (artwork.epoch) questions.push(`Was war in der ${artwork.epoch} anders?`)
  } else if (visitor.knowledge_level === 'expert' || visitor.knowledge_level === 'professional') {
    if (artwork.style) questions.push(`Wie ordnet sich das Werk in den ${artwork.style} ein?`)
    questions.push('Welche technischen Besonderheiten gibt es?')
    questions.push('Welche Vorbilder oder Einflüsse sind erkennbar?')
  } else {
    questions.push('Was ist die Bedeutung dieses Werks?')
    if (artwork.artist_name) questions.push(`Erzähle mir mehr über ${artwork.artist_name}`)
    if (artwork.epoch) questions.push(`Was war typisch für die ${artwork.epoch}?`)
  }

  return questions.slice(0, 3)
}

export default AiChat
