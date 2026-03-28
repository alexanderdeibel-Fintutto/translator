# Fintutto AMS/CMS — Architektur-Plan

## Überblick

Das **Account Management System (AMS)** ist das zentrale Backend für alle Fintutto-Produkte.
Es ersetzt und erweitert das bestehende `/admin` und `/crm-login` in der Consumer-App.

## Domain-Struktur

```
ams.fintutto.world          → Globales Account-Management (alle Produkte)
cms.fintutto.world/:slug    → Content-Management für Guide-Anbieter
portal.fintutto.world       → Bestehend: ArtGuide CMS (Museen/POIs)
```

## Rollen-Hierarchie

### Translator-Produkte (gt_-Namespace)

| Rolle | Beschreibung | Kann |
|---|---|---|
| `super_admin` | Du (Alexander) | Alles: Preise, Kontingente, alle Accounts |
| `super_admin_staff` | Dein Team | Leads anlegen, Accounts verwalten |
| `reseller` | Partner/Agentur | Eigene Kunden-Accounts anlegen |
| `admin` | Kundenaccount | Sessions erstellen, Nutzer verwalten |
| `staff` | Mitarbeiter des Kunden | Apps nutzen (speaker-Rolle) |
| `user` | Endnutzer | Apps nutzen (listener/guest-Rolle) |

### Guide-Produkte (ag_/fw_-Namespace)

| Rolle | Beschreibung | Kann |
|---|---|---|
| `super_admin` | Du (Alexander) | Alles |
| `city_admin` | Stadt/Region-Account | Alle Institutionen in der Stadt |
| `institution_admin` | Museum/POI-Betreiber | Eigene Inhalte, eigene Nutzer |
| `editor_chief` | Chefredakteur | Alle Inhalte freigeben |
| `editor` | Redakteur | Inhalte erstellen, nicht freigeben |
| `reviewer` | Prüfer | Inhalte prüfen und kommentieren |
| `billing_manager` | Abrechnungsverantwortlicher | Nur Rechnungen/Nutzung sehen |
| `visitor` | Endbesucher | Inhalte lesen (kein Login nötig) |

## Datenbank-Tabellen (geplant)

### Bestehend (gt_-Namespace)
- `gt_users` — Nutzer
- `gt_organizations` — Organisationen/Accounts
- `gt_leads` — Leads/Interessenten
- `gt_sessions` — Übersetzungssessions
- `gt_billing` — Abrechnung

### Neu zu erstellen
- `gt_roles` — Rollen-Definitionen
- `gt_user_roles` — User-Rollen-Zuordnung (mit org_id)
- `gt_invitations` — Einladungslinks (mit Rolle und Ablaufdatum)
- `gt_usage_quotas` — Kontingente pro Account/Tier
- `fw_cms_content` — CMS-Inhalte für Guide-Anbieter
- `fw_cms_revisions` — Inhalts-Revisionen mit Freigabe-Workflow
- `fw_cms_approvals` — Freigabe-Anfragen und -Entscheidungen

## App-Deployment-Plan

| App | Domain | Status |
|---|---|---|
| AMS (Account Management) | `ams.fintutto.world` | **Zu entwickeln** — aus /admin extrahieren |
| CMS (Content Management) | `cms.fintutto.world` | **Zu entwickeln** — für Guide-Anbieter |
| Sales | `sales.fintutto.world` | ✅ Angelegt |
| Portal | `portal.fintutto.world` | ✅ Deployed |

## Nächste Schritte

1. AMS als eigene App aus der Consumer-App extrahieren (AdminPage, CrmLoginPage, OrganizationManager, InviteGenerator, RevenueBoard)
2. Datenbank: `gt_roles`, `gt_user_roles`, `gt_invitations` anlegen
3. Guide-CMS: Freigabe-Workflow für Redakteure implementieren
4. Einladungslinks: Direkt aus AMS generierbar mit Rolle, Org und Ablaufdatum
