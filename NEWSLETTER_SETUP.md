# Newsletter & channels setup

Everything is optional and free. Each channel stays off until its env vars are set (locally in `.env`, on Vercel under Settings → Environment Variables, then redeploy).

The daily send runs at **06:00 IST** (`/api/cron/edition` in `vercel.json`). Test it any time:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://daily.ruro.in/api/cron/edition?dry=1"
```

`?dry=1` only counts; `?only=telegram` or `?only=email` sends one channel. Preview every format at **/admin/share**.

## 1. Email — Brevo (free: ~300 emails/day)

1. Sign up at brevo.com → **Senders, Domains & Dedicated IPs → Domains** → add `ruro.in` and add the DNS records it shows (do this once your domain is connected).
2. **Senders** → add `edition@ruro.in`.
3. **SMTP & API → API keys** → create a key.
4. Set `BREVO_API_KEY`, `NEWSLETTER_FROM_EMAIL=edition@ruro.in`, `NEWSLETTER_FROM_NAME=Ruro Daily`, and a random `NEWSLETTER_SECRET`.
5. Optional: create a list in Brevo and set `BREVO_LIST_ID` so signups also appear there.

Subscribers live in the database (`newsletter_subscribers`); every email has a working unsubscribe link and one-click unsubscribe headers.

## 2. Google Sheet copy of signups

1. Create a Google Sheet; name the first tab `Signups` with headers: `At | Email | Source | Action`.
2. **Extensions → Apps Script**, paste this, and change `SECRET`:

```js
const SECRET = "change-me"; // same as SHEETS_WEBHOOK_SECRET

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.secret !== SECRET) return ContentService.createTextOutput("forbidden");
  SpreadsheetApp.getActive().getSheetByName("Signups")
    .appendRow([data.at, data.email, data.source || "", data.action]);
  return ContentService.createTextOutput("ok");
}
```

3. **Deploy → New deployment → Web app**: Execute as *Me*, Who has access *Anyone* → Deploy → copy the URL.
4. Set `SHEETS_WEBHOOK_URL` (that URL) and `SHEETS_WEBHOOK_SECRET`.

## 3. Telegram channel (free, automatic)

1. In Telegram, message **@BotFather** → `/newbot` → copy the token.
2. Create a public channel (e.g. `@rurodaily`) → **Administrators → Add admin** → your bot (allow posting).
3. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID=@rurodaily`, and `NEXT_PUBLIC_TELEGRAM_URL=https://t.me/rurodaily` (shows the button on the site).

## 4. WhatsApp Channel (free, manual)

WhatsApp has no free API for broadcasts, so this is one paste a day:

1. WhatsApp → **Updates → Channels → Create channel**; copy its invite link into `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL`.
2. Each morning open **/admin/share** → **Copy for WhatsApp** → paste into the channel.

## 5. Podcast with a realistic voice (free tier)

Without this, **Listen** on `/edition` uses the reader's device voice. With it, every edition becomes a natural-sounding MP3, plus a podcast feed at `/podcast.xml` for Apple Podcasts / Spotify / Pocket Casts.

1. console.cloud.google.com → create a project → enable **Cloud Text-to-Speech API** (billing must be enabled, but usage stays inside the free monthly tier — ~1M WaveNet/Neural2 characters; one episode is ~3k characters and is generated at most 4×/day).
2. **APIs & Services → Credentials → Create API key** → restrict it to *Cloud Text-to-Speech API*.
3. Set `GOOGLE_TTS_API_KEY`. Optionally pick a voice with `GOOGLE_TTS_VOICE` (e.g. `en-IN-Neural2-A`, `en-IN-Neural2-B`, `en-GB-Neural2-A`).
4. Check: open `/api/podcast/<today's date>` — it should play. Then submit `https://daily.ruro.in/podcast.xml` to Spotify for Podcasters / Apple Podcasts Connect.

Tip: set a budget alert in Google Cloud Billing (e.g. ₹100) as a safety net.
