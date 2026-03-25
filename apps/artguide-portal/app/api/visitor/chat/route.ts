import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, artwork, lang = 'de', history = [], mode = 'standard' } = body

    if (!message || !artwork) {
      return NextResponse.json({ error: 'message and artwork required' }, { status: 400 })
    }

    const langNames: Record<string, string> = {
      de: 'Deutsch', en: 'English', fr: 'Français', es: 'Español', it: 'Italiano'
    }

    const audienceInstructions: Record<string, string> = {
      standard: 'Sprich den Besucher als interessierten Erwachsenen an. Informativ, aber zugänglich.',
      brief: 'Antworte sehr kurz und prägnant, maximal 2-3 Sätze.',
      detailed: 'Gib tiefgehende, kunsthistorische Antworten für ein Fachpublikum.',
      children: 'Sprich wie ein begeisterter Museumsführer für Kinder (6-12 Jahre). Einfache Sprache, viel Staunen, kurze Sätze.',
      youth: 'Sprich locker und direkt wie ein cooler älterer Freund. Für Jugendliche (13-17). Nicht zu förmlich.',
    }

    const systemPrompt = `Du bist "Buddy", der persönliche KI-Kunstführer von Fintutto Art Guide.
Du begleitest gerade einen Besucher bei diesem Kunstwerk:

**${artwork.title}** von ${artwork.artist_name} (${artwork.year_created || 'unbekannt'})
Medium: ${artwork.medium || 'unbekannt'} | Maße: ${artwork.dimensions || 'unbekannt'}
Standort: ${artwork.location || 'im Museum'}

Hintergrundinformationen:
${artwork.description_standard || artwork.description_brief || 'Keine weiteren Informationen verfügbar.'}

${artwork.fun_facts && artwork.fun_facts.length > 0 ? `Interessante Fakten: ${artwork.fun_facts.join(' | ')}` : ''}

Anweisungen:
- Antworte AUSSCHLIESSLICH auf ${langNames[lang] || 'Deutsch'}
- ${audienceInstructions[mode] || audienceInstructions.standard}
- Bleib immer im Kontext dieses Kunstwerks und des Museums
- Wenn du etwas nicht weißt, sage es ehrlich — erfinde keine Fakten
- Du darfst auch Fragen zurückstellen, um den Besucher zum Nachdenken anzuregen
- Halte Antworten unter 150 Wörtern, außer bei explizit detaillierten Fragen
- Sei warm, einladend und begeistert von Kunst`

    // Build conversation history for context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.'

    return NextResponse.json({
      reply,
      tokens_used: completion.usage?.total_tokens || 0,
    })

  } catch (error: unknown) {
    console.error('Chat error:', error)

    // Fallback response if OpenAI is not configured
    const body = await request.json().catch(() => ({})) as { artwork?: { title?: string }; lang?: string }
    const fallbackReplies: Record<string, string> = {
      de: `Das ist eine großartige Frage zu "${body.artwork?.title || 'diesem Werk'}"! Um den KI-Buddy zu aktivieren, bitte den OPENAI_API_KEY in den Umgebungsvariablen konfigurieren.`,
      en: `Great question about "${body.artwork?.title || 'this artwork'}"! To activate the AI Buddy, please configure the OPENAI_API_KEY in environment variables.`,
    }

    return NextResponse.json({
      reply: fallbackReplies[body.lang || 'de'] || fallbackReplies.de,
      demo: true,
    })
  }
}
