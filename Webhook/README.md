# Forever Funded Email Coach — Webhook Starter

This is the working core of the Email Coach pipeline: Postmark receives a
submitted supporter-email draft, this function evaluates it against the
Forever Funded Email Coach's system prompt, stores everything in Supabase,
and emails the report back.

**This project is meant to be finished in Claude Code**, not deployed from
this chat. It needs live API keys, a real `npm install`, and an actual
hosting deploy — none of which a chat sandbox can do. Open this folder in
Claude Code and work through the steps below.

---

## What this does, end to end

1. Postmark's Inbound stream receives an email sent to
   `anything@review.foreverfunded.org` and POSTs the parsed JSON to
   `/api/inbound`.
2. The function reads the recipient address to find the subscriber's unique
   token, and looks up their account in Supabase.
3. If they're on a trial and have used their allowance ("1 free email + 2
   revisions"), it sends an upgrade email instead and stops.
4. Otherwise, it detects whether the email was forwarded, splits off any
   writer-supplied context (using a `--- COACH CONTEXT ---` delimiter),
   calculates length/deliverability metrics, and calls the Anthropic API
   with the Coach's system prompt.
5. It stores the submission and the report in Supabase.
6. It emails the report back to the subscriber's **registered account
   email** (never back to whatever address the submission arrived from).
7. It increments their usage counter.

## Setup steps (do these in order)

This project deploys to **Cloudflare Workers** (configuration lives in
`wrangler.toml`; the `wrangler` command-line tool is installed by
`npm install` and run via `npx`).

1. **Install dependencies:** `npm install`
2. **Create the Supabase tables:** open `db/schema.sql`, and run it in your
   Supabase project's SQL Editor (Project > SQL Editor > New query > paste
   > Run).
3. **Log in to Cloudflare:** `npx wrangler login` (opens a browser window;
   approve the request).
4. **Set the four secrets in Cloudflare** — run each of these and paste the
   value when prompted:
   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler secret put POSTMARK_SERVER_TOKEN
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```
   - `ANTHROPIC_API_KEY` — from console.anthropic.com
   - `POSTMARK_SERVER_TOKEN` — Postmark > your Server > API Tokens
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase > Project
     Settings > API (use the **service role** key, not the public anon key —
     this function needs full read/write access and runs server-side only)

   Non-secret settings live in `wrangler.toml` under `[vars]`:
   - `ANTHROPIC_MODEL` — double-check the current recommended model string
     at docs.claude.com before deploying; models get updated over time
   - `FROM_EMAIL` — defaults to `coach@review.foreverfunded.org`, which works
     immediately because that subdomain is already verified in Postmark. To
     send from `hello@foreverfunded.org` instead, first add it as a Sender
     Signature in Postmark and confirm it, then change this value.

   (For local testing with `npx wrangler dev`, copy `.dev.vars.example` to
   `.dev.vars` and fill in the same four secrets — that file stays on your
   machine.)
5. **Add at least one test subscriber row manually** in Supabase, so there's
   something for the webhook to match against:
   ```sql
   insert into subscribers (email, review_token)
   values ('your-real-email@example.com', 'testtoken');
   ```
   That makes `testtoken@review.foreverfunded.org` a live, working review
   address for testing.
6. **Deploy:** `npx wrangler deploy`. It prints the live URL, e.g.
   `https://forever-funded-email-coach.<your-subdomain>.workers.dev`.
7. **Set the webhook URL in Postmark:** Server > Default Inbound Stream >
   paste in `https://<your-worker-url>/api/inbound` > Save changes.
8. **Send a real test:** email `testtoken@review.foreverfunded.org` from any
   address, and confirm a report arrives at the subscriber email you used in
   step 5. Check Postmark's Activity log and the Worker's logs (Cloudflare
   dashboard > Workers & Pages > your Worker > Logs, or `npx wrangler tail`
   in a terminal) if it doesn't.

## What's intentionally NOT built yet (and why)

This is a working v1, not the finished product — some things were
deliberately left out so the core pipeline could ship first:

- **Profile synthesis.** `derived_profile` exists in the schema but nothing
  currently writes meaningful data into it — the Coach still gets an empty
  or manually-set profile on every call. A real version would ask Claude to
  summarize recurring patterns after each report and update the subscriber's
  row. Worth building once there's real submission history to learn from.
- **The subscriber portal.** No login, no report history view, no
  conversational follow-up. All planned in the framework doc's
  "Conversational Follow-up" and "PDF Export" sections — intentionally
  post-launch, per that doc's sequencing notes.
- **The `expired` subscription status.** The webhook checks `trial` limits
  but doesn't yet handle a lapsed paid subscription the same way. Add that
  once billing exists.
- **Async/queued processing.** This function does everything synchronously
  in one request. Fine at launch volume; if evaluations start timing out at
  higher volume, consider acknowledging Postmark immediately (200 response)
  and processing the rest via a queue.
- **HTML sanitization on output.** The Coach is asked to return clean HTML
  directly. Watch real output during testing — if it ever wraps its
  response in markdown code fences or adds unwanted wrapper tags, add a
  small cleanup step before sending.

## Keeping this in sync with the framework doc

`lib/coachPrompt.js` is a hand-assembled copy of the system prompt and
report-format instructions from `forever-funded-email-coach-framework.md`.
That document is the single source of truth — if the Coach's behavior
changes there, this file needs a matching update. There's no automation
tying them together; treat it as a manual step whenever the framework doc's
SYSTEM PROMPT or REPORT STRUCTURE sections change.
