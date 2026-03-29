/**
 * ConversationAssistantPanel — Kombiniertes Assistenz-Panel
 *
 * Vereint alle drei Assistenz-Features in einem aufklappbaren Panel
 * das direkt in die ConversationPage integriert wird:
 *
 * Tab 1: Schnellantworten (SmartReplyBar)
 * Tab 2: Meine Phrasen (PersonalPhrasebook)
 * Tab 3: Gesprächsnotiz (ConversationSummary)
 *
 * Einbindung in ConversationPage:
 * <ConversationAssistantPanel
 *   lastGuestMessage={lastGuestMsg}
 *   messages={messages}
 *   context={contextMode}
 *   staffLang={bottomLang}
 *   guestLang={topLang}
 *   onSpeak={(text) => handleResult(text, 'bottom')}
 * />
 */

import { useState } from 'react'
import { Zap, BookOpen, FileText } from 'lucide-react'
import SmartReplyBar from './SmartReplyBar'
import PersonalPhrasebook, { SavePhraseButton } from './PersonalPhrasebook'
import ConversationSummary from './ConversationSummary'
import type { TranslationContext } from '@/lib/context-modes'

interface Message {
  id: string
  speaker: 'top' | 'bottom'
  original: string
  translated: string
  timestamp: number
}

interface ConversationAssistantPanelProps {
  /** Letzte Nachricht des Gastes (für Smart Replies) */
  lastGuestMessage: string
  /** Alle Nachrichten (für Zusammenfassung) */
  messages: Message[]
  /** Aktueller Kontext-Modus */
  context: TranslationContext
  /** Sprache des Mitarbeiters */
  staffLang: string
  /** Sprache des Gastes */
  guestLang: string
  /** Callback wenn eine Antwort/Phrase gesprochen werden soll */
  onSpeak: (text: string) => void
  /** Letzte eigene Nachricht des Mitarbeiters (für "Merken"-Button) */
  lastStaffMessage?: string
}

type ActiveTab = 'replies' | 'phrasebook' | 'summary'

export default function ConversationAssistantPanel({
  lastGuestMessage,
  messages,
  context,
  staffLang,
  guestLang,
  onSpeak,
  lastStaffMessage,
}: ConversationAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('replies')
  const [phraseToSave, setPhraseToSave] = useState<string | undefined>()

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'replies',
      label: 'Vorschläge',
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      id: 'phrasebook',
      label: 'Phrasen',
      icon: <BookOpen className="h-3.5 w-3.5" />,
    },
    {
      id: 'summary',
      label: 'Notiz',
      icon: <FileText className="h-3.5 w-3.5" />,
      badge: messages.length >= 4 ? messages.length : undefined,
    },
  ]

  return (
    <div className="space-y-2">
      {/* Tab-Leiste */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab-Inhalt */}
      {activeTab === 'replies' && (
        <div className="space-y-2">
          <SmartReplyBar
            lastGuestMessage={lastGuestMessage}
            context={context}
            staffLang={staffLang}
            guestLang={guestLang}
            onReply={onSpeak}
          />
          {/* "Merken"-Button für letzte eigene Nachricht */}
          {lastStaffMessage && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-muted-foreground truncate flex-1">
                Zuletzt: "{lastStaffMessage.slice(0, 40)}{lastStaffMessage.length > 40 ? '...' : ''}"
              </span>
              <SavePhraseButton
                text={lastStaffMessage}
                onSave={(text) => {
                  setPhraseToSave(text)
                  setActiveTab('phrasebook')
                }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'phrasebook' && (
        <PersonalPhrasebook
          onSpeak={onSpeak}
          phraseToSave={phraseToSave}
          onPhraseSaved={() => setPhraseToSave(undefined)}
        />
      )}

      {activeTab === 'summary' && (
        <ConversationSummary
          messages={messages}
          context={context}
          staffLang={staffLang}
          defaultExpanded={true}
        />
      )}
    </div>
  )
}
