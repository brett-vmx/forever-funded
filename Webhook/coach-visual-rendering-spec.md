# Build Spec — Add Mobile Visual Rendering to the Email Coach

**For:** Claude Code (implements against the live Cloudflare Workers repo)
**Written by:** Claude (chat) — design only. Do NOT treat any code-like snippet
here as paste-ready; write all actual code in the repo's existing Workers style
(`import`/`export`, `env` params) against the real files. This spec describes
*behavior and wiring*, not final source.

---

## Goal

Give the Coach a **visual rendering** of the email it's reviewing, so the
visual-judgment criteria stop being guesses. Right now the Coach receives only
text + HTML and cannot see what the email actually looks like — which forces it
to hedge on layout, photo quality, type size, and multi-column behavior, and is
the root cause of several soft/uncertain findings we've seen.

The fix: render the email's HTML to an image with **Cloudflare Browser
Rendering** (a first-party Workers binding — no third-party service, no separate
account), then pass that image into the same Anthropic API call as a base64
image block, alongside the text. Claude models accept images natively; the Coach
prompt already anticipates a "rendered image" input.

**Scope decisions (locked):**
- **Mobile viewport only** for now. This matches how the audience actually reads
  these and keeps latency/cost down. Desktop render can be added later if it
  proves necessary.
- Render at a **mobile width** — target ~390px wide (iPhone-class). Capture the
  **full page** (the whole email, not just the fold), then **tile** it into
  multiple readable segments — see "Tiling" below. (This replaces any notion of a
  single squashed screenshot or a fixed height cap.)
- **v2 pipeline only.** Rendering is wired into the v2 path exclusively. The v1
  path is left text-only, unchanged — see "v2-only" below.

---

## Pipeline change (where this slots in)

Current v2 flow (in `api/inbound.js`, `handleV2Submission`): identify profile by
slug → `can_request_review` → **`insertReceivedReview` (dedupe on
`postmark_message_id`)** → mark processing → parse/metrics → **call Coach** →
wrap report → `completeReview` → send.

New step goes **after the dedupe insert** (so a Postmark retry short-circuits
before we ever spend a render) and **before the Coach call**:

1. Take the email's **HTML body** (the same `HtmlBody` already in the payload).
2. Render it full-page at mobile width via the Cloudflare Browser Rendering
   **Puppeteer binding** (see "mechanics" below).
3. **Slice** the full-page image into vertical tiles, each under Anthropic's
   1568px long-edge limit, and pass them as a **sequence of separate image
   blocks** in the same Coach call (see "Tiling").
4. If rendering fails for any reason, **fall back gracefully**: call the Coach
   with text/HTML only, exactly as it works today. A render failure must never
   block a report from going out. (Log it so we can see how often it happens.)

### v2-only — do not wire this into the v1 path

Build rendering **only** into `handleV2Submission`. Leave the v1 (subscribers /
`review_token`) path completely untouched and text-only. Two reasons: v2 dedupes
on `postmark_message_id` *before* the render step, so a Postmark retry can't
trigger a duplicate render or a double Coach call; and v1 is now only Brett's own
test accounts, so there's nothing there worth the added latency or the
retry-safety concern. No feature flag needed to protect v1 — just don't add the
code to that branch.

---

## Cloudflare Browser Rendering — the mechanics

Claude Code: confirm current details against
`https://developers.cloudflare.com/browser-rendering/` before implementing, since
this product's API and limits evolve.

Use the **Puppeteer binding**, *not* the REST `/screenshot` Quick Action. These
are two different things and the earlier draft of this spec conflated them:
- The **Puppeteer binding** is the first-party, **no-token** path — add a
  `browser` binding in `wrangler.toml`, install `@cloudflare/puppeteer`, and
  drive it in code: `puppeteer.launch(env.<BROWSER_BINDING>)` → `newPage()` →
  `page.setViewport({ width: ~390, ... })` → `page.setContent(HtmlBody, { waitUntil: 'networkidle0' })`
  → `page.screenshot({ fullPage: true })` → close the browser. This returns the
  full-page image we then slice.
- The **REST `/screenshot` Quick Action** is a separate HTTP API that **requires
  an account API token**. Do **not** use it here — the binding gives us what we
  need without managing another secret.

- Confirm the Worker's `compatibility_date` is recent enough for the binding
  (already on `2026-07-01`, which is fine — verify against docs anyway).
- **Options to set:** viewport width ~390px; `fullPage: true`; input is the
  email's `HtmlBody` string via `setContent`. Image format PNG or JPEG (JPEG is
  smaller; fine here).
- **Output:** a full-page image buffer, passed to the tiling step below.

### Tiling — turning one tall image into readable segments

A full-page mobile capture of a long letter is *very* tall — a real example
measured **~18,800px**. Anthropic scales any image so its long edge is ≤1568px,
so that single image would be squashed to roughly **130px wide — illegible** —
and a fixed height cap (an earlier idea) would simply crop away most of the
letter. Neither works. So instead:

1. Capture the **full page** at ~390px width (per above).
2. **Slice** the resulting image vertically into segments each **under 1568px
   tall** (so each tile stays at full, unscaled resolution — ~390px wide and
   readable).
3. Pass the tiles as an **ordered sequence of separate `image` blocks** in the
   **same** Coach call. Claude reads multiple images in one user message
   natively and will see them top-to-bottom as the continuous letter.
4. **Label each tile's position explicitly — don't rely on array order alone.**
   A dozen near-identical vertical slices of the same email are easy to
   misjudge positionally. Give each image block an accompanying short text
   anchor (e.g. "Tile 3 of 9, top to bottom") so the Coach can reliably reason
   about *where* something sits in the letter (e.g. whether the give button is
   near the top or the bottom). Cheap to add, meaningfully reduces
   position-judgment errors.
5. **Cap the tile count at ~12–15.** If a letter is so long it would exceed the
   cap, tile what fits (from the top) and tell the Coach (via the prompt) that it
   is seeing a **truncated view of a very long email** — which is itself a length
   signal worth raising in the report, not just a rendering limitation.

### Cost / limits — flag before enabling for every email
Browser Rendering is a separate resource from Workers requests, with its own
plan quota and pricing tier, and rendering adds latency (a headless render takes
real time — likely a few seconds) on top of the Claude call. Before flipping
this on for 100% of submissions:
- Check the current plan's included Browser Rendering quota vs. expected volume.
- Confirm the added latency stays within the runtime limits (CPU time isn't the
  concern — both the render and the Coach call are I/O wait — but verify Browser
  Rendering's own per-session limits and that the total round-trip is comfortable
  against Postmark's inbound-webhook retry window).

**Token cost scales with tiling.** The one-image assumption behind an earlier
"~1–2k tokens, under a cent" estimate no longer holds: image tokens are roughly
`(width × height) / 750` **per tile**, so a long letter sliced into ~8–12 tiles
adds meaningfully more than a single image — still likely only a **few cents per
report**, but it grows with letter length. Reports currently average **~12 cents
or less**; during the soft rollout we'll **measure the real added token cost and
render time on actual letters** before enabling broadly.

---

## Anthropic API change (`lib/anthropic.js`)

The Coach call currently sends a single text user-message. Change it so the
user-message `content` is an **array** when a render is available:

- **the ordered sequence of tile `image` blocks** (type `base64`, each a
  readable ~390px-wide slice — see "Tiling"), in top-to-bottom order — **each
  image block immediately preceded by its own short `text` block labeling its
  position** (e.g. "Tile 3 of 9, top to bottom"), so the Coach has an explicit
  positional anchor per tile rather than relying on array order alone — followed
  by
- the existing text block (letter text, context, profile, metrics, forward flag).

So the function accepts an **optional array of tile images** (zero, one, or many)
and builds the content array conditionally, interleaving each tile's label with
its image block. When the array is empty (render failed, or feature disabled),
send text only, exactly as today.

Keep everything else — model string, `max_tokens: 6000`, the system prompt,
message-building logic — unchanged. This is purely prepending the optional image
tiles to the user turn.

---

## Coach prompt changes (`lib/coachPrompt.js`)

Two categories of change. All are content edits to the `COACH_SYSTEM_PROMPT`
string — targeted find/replace, never a full-file replace.

### A. Tell the Coach it now has a mobile render (when present)

Add a note (near where the prompt describes its inputs) that it may now receive
a **mobile-width rendered view** of the email — delivered as **one or more
stacked image tiles**, to be read top-to-bottom as the continuous letter — and
should use it to judge what it previously had to infer: photo presence/quality,
actual type size, white space, single-column flow, button clarity, centered-text
blocks, and how multi-column sections collapse on a phone. Guardrails to keep:
- **Still never proofread spelling/grammar from the image** — text errors are
  judged only from the actual text body (vision can misread small text). This
  rule stays exactly as-is.
- The **"unseen image content" guardrail we just added** should be made
  conditional: when a render IS provided, the Coach CAN now see inside
  images, so it no longer needs to soften layout/structure observations for lack
  of a visual — it should speak with normal confidence. Keep the softening
  behavior only for the fallback case (text-only, no render). Word it so the
  Coach keys off "if a rendered image is provided."
- **A broken/absent photo in the render is not proof the email has no photo.**
  Forwarded drafts sometimes embed images as `cid:`/attachment references that a
  headless browser can't resolve, so they show up blank or broken in the render
  even though the recipient's mail client would display them. The Coach must not
  confidently report a missing or broken image based on the render alone — if the
  text/HTML suggests an image is intended, treat a blank spot as possibly a
  rendering limitation and soften accordingly (this is the one image-presence
  case where hedging is still correct even when a render exists).
- When the render is a **truncated view of a very long email** (tile cap hit —
  see "Tiling"), the Coach should treat that as a genuine **length signal** worth
  raising, not just a technical caveat.

### B. The positional-caption flag (new, checkable now that vision exists)

Add guidance (Images / formatting area): watch for image-gallery captions that
use **positional language** — "top left," "right," "bottom center," etc. — that
assume a multi-column desktop layout. On mobile, galleries collapse to a single
vertical column, so "top left" points at a position that no longer exists and
the caption reads as wrong/confusing. Flag it as a real (but gently delivered)
fix: recommend a **single-column layout with a caption tied to each individual
image**, so each photo carries its own description regardless of how the grid
reflows. Praise the instinct to caption (it's good!) — the fix is just making
the captions position-independent.

---

## Framework doc sync (`forever-funded-email-coach-framework.md`)

Mirror both prompt changes into the source-of-truth doc:
- Update the vision/data-model note to reflect that mobile rendering is now
  **built**, not just anticipated, and that the visual criteria (IMG-*, FMT-3,
  FMT-4) move from Partial to fully checkable when a render is present.
- Make the "unseen image content" working-note conditional (only applies to the
  text-only fallback path now).
- Add the positional-caption criterion (a new IMG-* entry, e.g. IMG-3
  "Position-Independent Captions").

---

## Verification (Claude Code should confirm)

1. Local boot still starts cleanly.
2. A test submission (on the **v2 path**) with a real HTML email produces a
   render (check logs / confirm the expected number of image **tiles** is
   attached to the Anthropic call).
3. Confirm a **long** email tiles correctly: multiple segments, each under the
   1568px limit, in top-to-bottom order — and that a letter past the ~12–15 tile
   cap is truncated-and-flagged rather than squashed or erroring.
4. Force a render failure (e.g. bad binding) and confirm the report STILL sends,
   text-only — graceful fallback works.
5. Send a real email with a multi-column photo gallery using "top left"-style
   captions; confirm the Coach (a) correctly reads the layout from the mobile
   render and (b) flags the positional captions with the single-column fix.
6. Confirm a v1 (`review_token`) submission is **untouched** — text-only, no
   render attempted.
7. Confirm the whole request (render + Coach) stays within runtime limits and
   comfortably inside Postmark's webhook retry window.
8. Postmark webhook URL unchanged after deploy.

---

## Sequencing note

This is a **next-phase feature**, not a launch blocker — text-based coaching
already carries real weight. Good to build once the pilot basics are stable.
When enabling, consider a soft rollout: render for your own test submissions
first, watch cost/latency/quality for a few real letters, then enable for all.
