# HerCare+

A simple, private, **multilingual women's health, safety and doctor-search app** for rural and
underserved communities in India. It runs on low-end phones over 2G/3G, works largely **offline**,
and speaks in **English, हिन्दी (Hindi) and ಕನ್ನಡ (Kannada)** with voice input and text-to-speech.

> **Honesty note.** This is a hackathon reference build. Every external integration (SMS delivery,
> live AI model, hosted database) has a safe, clearly-labelled fallback and is **off by default**.
> The app never invents doctors, phone numbers, translations or credentials, and never claims an
> unconfigured feature works. Demo/fallback data is always flagged in the UI.

---

## What it does

| Area | Description |
| --- | --- |
| **Auth** | Phone-OTP sign-in collecting **only name + phone**. Server-owned OTP (expiry, rate limits, constant-time verify). No passwords. |
| **Home blocks** | About · Awareness · **Find your doctor** · Daily Wellness Journal · Care & Protect (Safety). |
| **Find your doctor** | The priority feature. Offline-first location cascade (State → District → Block → Village) with filters (free/subsidised, women doctor, specialty, ownership) and actionable, verified-format cards. Facility data is **sample/demo** and clearly flagged. |
| **Wellness Journal** | Privacy-first recovery & wellness tracker with an optional **PIN gate**, days-sober, money-saved, mood/pain logs, breathing exercise and helplines. Content is **flagged as demo**. |
| **Care & Protect** | One-tap SOS to **112 / 181 / 1098**, trusted contacts, a harassment/incident report form, and an evidence-preservation guide. |
| **Dashboards** | Periods & hygiene · Pregnancy / Newborn · General health & elder care with a deterministic **green / amber / red triage** that never diagnoses. |
| **AI assistant** | Top-right, voice in/out. A deterministic **emergency detector runs before any conversation**, in all three languages. Answers are general, non-diagnostic, and fall back to curated content when no model is configured. |
| **Privacy** | Quick-exit button, per-device per-user storage isolation, and WhatsApp/SMS sharing that **never leaks health records**. |

**Accessibility:** WCAG 2.2 AA-minded — 44px tap targets, severity never conveyed by colour alone
(icon + text), audio guidance, screen-reader landmarks and a skip link.

---

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite, Tailwind CSS, Lucide icons, React Router, React Hook
  Form + Zod. Installable **PWA** (service worker + web manifest, offline shell).
- **Backend:** Node + Express (TypeScript, run with `tsx`). OTP issuance/verification and the AI
  proxy. Provider abstractions for SMS (console / Twilio / MSG91) and AI (demo / OpenAI-compatible).
- **Data (reference build):** per-user `localStorage` on-device. A Supabase/PostgreSQL schema with
  row-level security is provided as the production seam (`server/supabase/schema.sql`).

---

## Quick start

> Requires **Node.js 18+**. On Windows, if `node`/`npm` are not on your PATH, use the full path
> (e.g. `C:\Program Files\nodejs\npm.cmd`) or add that folder to PATH for the session.

```bash
# 1. install
npm install

# 2. configure (optional for the dev flow — sensible fallbacks everywhere)
cp .env.example .env

# 3. start the API (terminal 1)
npm run dev:server        # -> http://localhost:8787

# 4. start the web app (terminal 2)
npm run dev               # -> http://localhost:5173  (proxies /api to the API)
```

Open <http://localhost:5173>. Register with any valid Indian mobile number. In development the API
runs in **OTP dev-mock mode**, so the generated code is returned to the client and shown on the
verify screen — no real SMS is sent.

### Trying it without the backend
The frontend degrades gracefully: the AI assistant falls back to curated on-device content. OTP
**requires** the API to be running (there is no mock sign-in shortcut in the client).

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server (proxies `/api` → `http://localhost:8787`). |
| `npm run dev:server` | Express API in watch mode. |
| `npm run build` | Type-check (`tsc --noEmit`) then production build to `dist/`. |
| `npm run preview` | Serve the built `dist/`. |
| `npm run typecheck` | Type-check only. |
| `npm run lint` | ESLint over `src`, `server/src` and `tests`. |
| `npm test` | Unit/integration tests (OTP flow, security, storage scope, triage). |
| `npm run test:api` | End-to-end API tests (boots the app on an ephemeral port). |

---

## Configuration

All configuration is environment-driven — see [`.env.example`](./.env.example) for the full,
annotated list. Highlights:

- **`OTP_DEV_MOCK`** — return the OTP in the API response for testing. **Forced OFF in
  `NODE_ENV=production`**, so codes are never leaked. There is **no hardcoded OTP**.
- **`SMS_PROVIDER`** — `console` (default, simulated, delivers nothing), `twilio`, or `msg91`.
  A real provider is used only when its credentials are present; otherwise it falls back to console.
- **`AI_PROVIDER`** — `demo` (default) or `openai`. A live model is contacted only when
  `AI_PROVIDER=openai` **and** `AI_API_KEY` **and** `AI_ENDPOINT` are all set; otherwise the client
  uses its curated, non-diagnostic content and the endpoint reports `demo: true`.
- **`CORS_ORIGINS`** — comma-separated allowed origins. Empty = same-origin only (recommended with
  the Vite proxy).

**The browser never holds SMS or AI secrets** — those live only on the server. The client calls the
relative path `/api`.

---

## Security & privacy posture

- OTP codes are generated with a CSPRNG and stored **only as a salted SHA-256 hash**; verification
  uses a **constant-time** comparison. Expiry, per-attempt and per-hour limits are server-owned.
- Health records are scoped **per user on-device**; one user's data is never visible to another
  (covered by `tests/storage-scope.test.ts`).
- Sharing (WhatsApp/SMS) sends a neutral help message — **never** health-record contents.
- Emergency detection is deterministic and runs **before** the conversation, over-triggering toward
  safety, in all three languages.
- Supabase schema (`server/supabase/schema.sql`) enables **row-level security** with owner-only
  policies; `otp_requests` is never readable by clients.

---

## Project layout

```
src/
  components/     common UI, layout (AppShell, quick-exit, nav), feature panels
  context/        Auth, Language, UI contexts
  data/           awareness, content, facilities (sample), helplines, symptoms (triage rules)
  hooks/          useOnline, useSpeechInput
  i18n/           English / Hindi / Kannada dictionaries + typed translator
  pages/          auth, dashboard, journal, and top-level feature pages
  services/       auth, otp, records (device storage), ai, speech, share
  utils/          storage, date, id, phone
server/
  src/            config, sms providers, otpStore, assistant, express app (index)
  supabase/       schema.sql (RLS-ready production seam)
tests/            otp-flow, security, storage-scope, triage, api.e2e
```

---

## Testing

```bash
npm test          # OTP flow, security guarantees, storage scope, triage
npm run test:api  # boots the Express app and exercises /api over HTTP
```

Tests use the built-in `node --test` runner via `tsx` (which also resolves the `@/*` alias so client
modules are testable under Node). Each test file runs in its own process so per-process env
snapshots (e.g. `NODE_ENV=production`) are isolated.

---

## Production / deployment notes (what is intentionally NOT wired up)

This reference build is complete and runnable, but the following are **seams, not finished
integrations** — do not claim they work until you configure and verify them:

- **Real SMS delivery** — plug Twilio/MSG91 credentials and set `SMS_PROVIDER`. Untested against
  live carriers here.
- **Live AI model** — set `AI_PROVIDER=openai` + `AI_API_KEY` + `AI_ENDPOINT`. Content remains
  general and non-diagnostic by design.
- **Hosted database & real accounts** — apply `server/supabase/schema.sql`, then move the
  device-local stores (`src/services/records.ts`, `auth.ts`) and the in-memory OTP store to
  Supabase. The interfaces are already shaped for this.
- **Real clinic/doctor directory** — the facilities data in `src/data/facilities.ts` is **sample
  only** and clearly flagged; it must be replaced with a verified official source before real use.
- **Signed sessions** — the OTP verify endpoint returns an opaque token; a production deployment
  should issue a signed JWT / Supabase session.

**Medical disclaimer:** HerCare+ provides general health information, not medical advice,
diagnosis, or prescription. Users are always directed to confirm with a qualified health worker and
to call emergency services for red-flag symptoms.
