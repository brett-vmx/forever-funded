# Build Spec — Profile Restructure + Reports History + PDF + Continue-the-Conversation

**For:** Claude Code
**Product:** Forever Funded AI Email Coach (Vite/React on Cloudflare Pages,
Supabase w/ RLS, Cloudflare Worker holding service role + an already-deployed
Cloudflare Browser Rendering (Puppeteer) binding used today for email visual
rendering).

Build in order. **Parts A–C are achievable now and reuse existing infrastructure.
Part D (chat) is the largest piece — build it as its own session after A–C ship.**
Stop at each ⏸ checkpoint.

---

## What already exists (context — don't rebuild)

- `reviews` table stores, per completed review: `report_body` (the report HTML),
  `draft_body` (the submitted letter), `subject`, `word_count`, `flags`,
  `status`, `created_at`, `completed_at`. RLS returns **only the user's own rows**.
- The Coach emits **clean semantic HTML with no inline styling**; visual styling
  is applied by `reportTemplate.js` (single source of visual truth).
- The Worker already launches **Cloudflare Browser Rendering (Puppeteer)** for
  email visual rendering — follow that existing launch pattern; don't invent a new
  one.
- `/profile` currently has three stacked cards: review address, account status
  (used/remaining/expiry), and the optional details form.
- Anthropic evaluation runs server-side in the Worker (same model/config the Coach
  already uses).

---

## Design decisions (the architectural steers)

1. **PDF source = `reviews.report_body` in Supabase, NOT Postmark.** Your DB is the
   permanent source of truth; Postmark's stored copy is transient and rate-limited.
   Every completed review can be rendered because its HTML is already stored.
2. **PDF rendering = the existing Cloudflare Browser Rendering (Puppeteer) binding**,
   via `page.pdf()`. Reuse the deployed infra — no new hosted service, no new key.
   (This supersedes the framework doc's older "use a hosted service" note, which
   predated you having Browser Rendering.)
3. **Generate PDFs on-demand, stream to the user, store nothing** (for now). Low
   volume makes caching unnecessary; note Supabase Storage as a later caching
   optimization if generation latency or session limits become an issue.
4. **Authorization via RLS, not a new mechanism.** The PDF and chat endpoints
   create a Supabase client using the *user's* access token; RLS then guarantees a
   user can only ever fetch/act on their own reviews. No client-sent HTML is
   trusted for rendering — the server fetches `report_body` itself by `review_id`.
5. **Review-address domain stays in one config constant** (rename is coming).

---

## PART A — Tab restructure (Account · Reports · Subscription)

Convert `/profile` from stacked cards to three **text-only** tabs (no icons):
**Account · Reports · Subscription**.

- **Persistent element:** keep **"Your private review address"** visible above/
  outside the tabs (or pinned at the top of Account) — it's the most-used thing on
  the page and shouldn't be a tab-click away from the core action.
- **Account tab:** the existing details form (name, city, country, college campus,
  organization, ministry, Context for the Coach) + the reviews-used/remaining and
  expiration status for now.
- **Reports tab:** Part B below (empty state until they have reviews).
- **Subscription tab:** a placeholder shell for now — a simple "Account status"
  block. Note the future states for when Stripe lands (build the shell, not the
  logic): **Trial** (Upgrade button), **Trial expiring soon** (~within 7 days —
  Upgrade, more urgent tone), **Unlimited/Active**, **Expired** (Renew button).
  Leave the buttons non-functional/stubbed with a "coming soon" until Stripe.

**⏸ Checkpoint** — show the tab shell working (content can be minimal) before Part B.

---

## PART B — Reports tab: submission & report history

List the user's reviews, newest first, read directly via RLS (no Worker needed):
```js
const { data: reviews } = await supabase
  .from('reviews')
  .select('id, subject, word_count, status, created_at, completed_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```
(RLS already restricts to the user's own rows.)

- Each row: subject (or "(no subject)"), date, status, and — for completed
  reviews — actions: **View report** and **Download PDF** (Part C).
- **View report:** render the stored `report_body` in-app (fetch it lazily when
  opened, not in the list query, to keep the list light). Wrap it in the same
  `reportTemplate` styling so it looks like the emailed version.
- Show a friendly empty state when there are no reviews yet ("Your reviewed
  letters will appear here — send your first draft to your review address above.").
- `failed` reviews: show quietly as "not completed," no PDF/view action.

**⏸ Checkpoint** — history list + in-app view working before Part C.

---

## PART C — PDF download (Worker endpoint via Browser Rendering)

Add a Worker route, e.g. `POST /api/report-pdf`, that renders a single report to
PDF. **Targeted edits inside the existing Worker files only — no full-file .js
replacements.**

**Flow:**
1. Frontend calls the route with `{ review_id }` and the user's Supabase access
   token in the `Authorization: Bearer` header.
2. Worker creates a Supabase client **with that user token** and selects
   `report_body` (and `subject`, `created_at`) from `reviews` where `id =
   review_id`. RLS ensures this returns a row **only if the user owns it**; if no
   row, return 404 — this is the whole authorization check, no extra logic needed.
3. Wrap `report_body` in the `reportTemplate` styling (add a print-oriented
   wrapper: A4, sensible margins, `printBackground: true`). Include the framework's
   quiet referral footer — "Reviewed with the Forever Funded Email Coach" + link
   (use the domain constant) — since a shared PDF is gentle marketing.
4. Launch Browser Rendering **using the existing pattern in the Worker**,
   `page.setContent(fullHtml, { waitUntil: 'networkidle0' })`, `page.pdf({...})`,
   close the browser.
5. Return the PDF with `content-type: application/pdf` and
   `content-disposition: attachment; filename="forever-funded-review-{date}.pdf"`.

**Notes:**
- Close the browser/page in a `finally` so a render error doesn't leak sessions
  (Browser Rendering has session limits).
- Do not trust any client-supplied HTML — always fetch `report_body` server-side
  by `review_id`.

**⏸ Checkpoint** — download a real past report as a clean PDF; confirm a user
cannot fetch another user's review_id (should 404).

---

## PART D — Continue the conversation (largest piece — separate session after A–C)

A chat box beneath a past report, so the writer can ask "why did you flag that?",
request a rewrite, or explain a choice — continuing under the Coach's voice.

### D1. Migration (SQL Editor, wrapped in BEGIN;/COMMIT; — hand me the file)
```sql
BEGIN;

create table public.review_messages (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews(id)  on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index review_messages_review_id_idx on public.review_messages(review_id);

alter table public.review_messages enable row level security;

-- Read own only. All writes happen server-side via the service role (matches the
-- existing reviews pattern), so no insert policy for clients.
create policy "review_messages_select_own"
  on public.review_messages for select
  using (auth.uid() = user_id);

grant select on public.review_messages to authenticated;

COMMIT;
```

### D2. Worker chat endpoint (e.g. `POST /api/report-chat`)
- Input: `{ review_id, message }` + user token.
- Verify ownership via RLS (user-token client select on `reviews` — same pattern as
  Part C).
- Load context: `draft_body` + `report_body` for the review, plus prior
  `review_messages` for that review (chronological).
- Build the Anthropic call under the **same `COACH_SYSTEM_PROMPT`** so it stays in
  character, plus the framework's conversational guardrail: the Coach is
  **genuinely non-defensive** — happy to be corrected, quick to say "you're right,
  I misread that," never doubling down to protect its report. Pass the letter +
  report as context and the full message history each turn (stateless rebuild).
- Store the user turn and the assistant turn (service role writes).
- Enforce a **soft turn cap per report** (generous — normal use never hits it) to
  bound cost; return a friendly message when reached.
- Return the assistant reply.
- **Targeted edits only** in Worker files; follow existing conventions.

### D3. Frontend chat UI
- Beneath an opened report in the Reports tab: a simple message thread + input.
- Load history via RLS select on `review_messages` for that review.
- Send turns to the Worker endpoint; append replies.

### D4. Guardrails / scope for v1 (important)
- **v1 changes nothing durable about the profile.** Per the framework, the chat's
  default is to learn nothing permanent — someone can argue or think out loud
  without the Coach silently "learning" something inaccurate. **Do not** write to
  the profile from the chat in v1.
- The "propose a profile update, user confirms" mechanism is a **later** iteration
  — note it, don't build it yet.
- Session-level re-evaluation (reconsidering *this* report in light of what the
  writer says) is fine and expected; it just doesn't become a durable fact.

**⏸ Checkpoint** — migration file for me to run first; then endpoint; then UI.

---

## Verification

- **A:** tabs switch; review address stays visible/prominent; existing form intact.
- **B:** history lists own reviews newest-first; in-app view matches the emailed
  report's look; empty state shows for new users.
- **C:** a past report downloads as a clean, styled PDF; fetching another user's
  `review_id` returns 404 (RLS authz proven).
- **D:** chat loads report context, stays in the Coach's voice, is non-defensive
  when challenged; turn cap works; **confirm no durable profile write occurs from
  chat**; a user cannot read another user's `review_messages`.

---

## Hard rules (apply throughout)

- Migrations via the **SQL Editor**, wrapped in `BEGIN;`/`COMMIT;` — service-role
  key can't run DDL. Hand me the file; don't apply programmatically.
- **No full-file `.js` replacements** for any Worker file — targeted edits only.
- Reuse the **existing Browser Rendering launch pattern**; don't add a new PDF
  service.
- Never trust client-sent HTML for rendering — fetch `report_body` server-side.
- Keep the review-address domain in one config constant (rename coming).
- Stop at each ⏸ for my confirmation before proceeding.
