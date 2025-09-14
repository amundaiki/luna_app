Kravspesifikasjon – Mobilvennlig kundeløsning (PWA/app) for Leads,

Kampanjer og Statistikk
Formål: Levere en mobilvennlig løsning (PWA først, senere mulig native app) der kunder
kan logge inn, se kampanjer og statistikk fra Meta, motta og behandle leads i sanntid,
kontakte leads med ett klikk, og booke befaringer med kalender/ICS – med full team-synk
og GDPR‑sporbarhet.

1. Kjernefunksjoner (MVP)
• Innlogging (multi-tenant). Roller: Owner, Manager, Agent.
• Lead-innboks i sanntid (WebSockets). Ett-trykk Ring/SMS/E-post/WhatsApp.
• Statusflyt pr. lead: new → contacted → no_answer → scheduled → won/lost.
• Forsøksteller: logg alle call/SMS/e-post med tidsstempel og bruker.
• Booking av befaring: innebygd kalender, ICS‑invitasjon, bekreftelse på SMS/e-post.
• Kampanjevisning: spend, impressions, clicks, CTR, CPL (Meta Insights).
• Dashbord: dag/uke/måned leads, CPL, kontaktgrad, avtalegrad, vinnerate, respons‑tid.
• Varsler: Web push/e-post ved nye leads og SLA‑brudd (f.eks. ikke kontaktet innen 15
min).

2. Nice-to-have (V2+)
• Auto‑oppfølgingssekvenser (SMS/e-post ved ikke svar).
• Round‑robin/claim‑logikk for rettferdig fordeling av leads.
• Kvalitetsskår (regler/AI) basert på felter, tidspunkt og engasjement.
• Dokumenthåndtering: tilbud/ordrebekreftelser knyttet til lead.
• Offline‑buffer (PWA) for siste liste og detaljer.

3. Integrasjoner
• Meta Lead Ads: webhook + Graph API for lead‑felter og form‑mapping.
• Meta Ads Insights: henting av spend/metrics på campaign/adset/ad.
• SMS: Twilio/MessageBird. E‑post: Sendgrid/Mailgun.
• Kalender: ICS‑invitasjoner; V2: Google/Outlook‑sync (OAuth).
• Valgfritt CRM: Pipedrive/HubSpot/Google Sheets (webhooks/API).

4. Datamodell (utdrag)
Customer(id, navn, orgnr, plan, logo_url, farger) • User(id, name, email, role, customer_id) •
Campaign(id, platform, account_id, navn, budsjett) • Lead(id, customer_id, campaign_id,
adset_id, ad_id, source, full_name, phone(E.164), email, postal_code, service, message,
gdpr_consent, consent_version, created_at, status, assignee_user_id, attempts[],
last_contact_at) • Appointment(id, lead_id, start_dt, end_dt, location, notes, status) •
MetricsCache(dato, campaign_id, spend, impressions, clicks, leads, cpl) • AuditLog.

5. Teknologi
• Frontend: Next.js (React) PWA, Tailwind, TanStack Query.
• Backend: Node.js (NestJS/Express) eller Python (FastAPI).
• Realtime: Socket.IO eller Supabase Realtime.
• Database: PostgreSQL (Supabase) + Redis for kø/retries.
• Auth: Clerk/Auth0. Hosting: Vercel (front), Fly.io/Render (API).
• Observability: Sentry + logs/metrics (Prometheus/Grafana).

6. Sikkerhet & GDPR
• Samtykke lagres med tekstversjon og timestamp (per lead).
• Kryptering: TLS i transitt, AES‑256 at rest for personfelt.
• RBAC, audit‑logg, IP‑begrensning for admin (valgfritt).
• Retensjon: slett persondata 12–18 mnd; aggregerte tall bevares.
• Backups daglig; definert RPO≤1t, RTO≤4t.

7. API‑endepunkter (eksempler)
• POST /webhooks/meta‑lead – verifisering + henting av lead data (Graph API).
• GET /leads?status=… – liste med paginering/filtre (kunde‑scoped).
• PATCH /leads/{id} – oppdater status, legg til forsøk/notat.
• POST /appointments – opprett befaring + send ICS/SMS/e‑post.
• GET /insights/summary – nøkkeltall for dashboard.

8. Akseptkriterier (MVP)
• Kunde kan logge inn og se sine leads og kampanjetall.
• Nye leads dukker opp uten reload; kontakt med ett trykk logges.
• Booking m/ICS og varsling fungerer.
• Daglige nøkkeltall vises korrekt og samsvarer med Meta innen ±10%.
• Varsel ved nytt lead og SLA‑brudd leveres.