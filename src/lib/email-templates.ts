// Email Templates — Default templates for CRM outreach.

import type { EmailTemplate } from './admin-types'

export type { EmailTemplate }

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    name: 'Erstansprache',
    subject: 'GuideTranslator fuer {{company}}',
    body: `Hallo {{name}},

ich habe gesehen, dass {{company}} Touren/Events in mehreren Sprachen anbietet. Wir haben eine Loesung entwickelt, mit der Sie Dolmetscherkosten um bis zu 90% reduzieren koennen.

Darf ich Ihnen in 15 Minuten zeigen, wie das funktioniert?

Hier ist ein Link mit einer persoenlichen Kalkulation fuer Sie:
{{link}}

Beste Gruesse,
Das GuideTranslator Team`,
  },
  {
    name: 'Demo-Einladung',
    subject: 'Ihre persoenliche Demo — GuideTranslator',
    body: `Hallo {{name}},

vielen Dank fuer Ihr Interesse an GuideTranslator! Ich wuerde Ihnen gerne in einer kurzen Demo zeigen, wie die Loesung fuer {{company}} funktioniert.

Wann passt es Ihnen diese Woche? Ich schlage folgende Zeiten vor:
- Dienstag 10:00 Uhr
- Mittwoch 14:00 Uhr
- Donnerstag 11:00 Uhr

Den Einladungslink fuer Ihren persoenlichen Zugang finden Sie hier:
{{link}}

Beste Gruesse,
Das GuideTranslator Team`,
  },
  {
    name: 'Angebot',
    subject: 'Ihr individuelles Angebot — GuideTranslator',
    body: `Hallo {{name}},

wie besprochen sende ich Ihnen hier das individuelle Angebot fuer {{company}}.

Die Kalkulation basiert auf Ihren Anforderungen und zeigt die Ersparnis gegenueber der aktuellen Loesung:
{{link}}

Ich freue mich auf Ihr Feedback!

Beste Gruesse,
Das GuideTranslator Team`,
  },
  {
    name: 'Nachfassen',
    subject: 'Kurzes Follow-up — GuideTranslator',
    body: `Hallo {{name}},

ich wollte mich kurz melden — haben Sie schon Gelegenheit gehabt, sich unser Angebot anzuschauen?

Falls Sie Fragen haben oder einen Termin fuer eine Demo vereinbaren moechten, stehe ich gerne zur Verfuegung.

{{link}}

Beste Gruesse,
Das GuideTranslator Team`,
  },
]

export function renderTemplate(
  template: EmailTemplate,
  vars: Record<string, string>,
): { subject: string; body: string } {
  let subject = template.subject
  let body = template.body
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`
    subject = subject.split(placeholder).join(value)
    body = body.split(placeholder).join(value)
  }
  return { subject, body }
}
