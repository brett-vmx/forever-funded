# Build Spec — Forever Funded Coach Landing Page

**For:** Claude Code
**Goal:** Build the public marketing page for the Forever Funded Email Coach at foreverfunded.org, launching Friday. Coach-only; the Course is a light "coming soon" teaser. Deploy target is Cloudflare Pages. Dev server is already running on **http://localhost:5173** (Vite).

---

## Read first

1. **`forever-funded-coach-landing-copy.md`** (in this repo) — the exact page copy, section by section. Build from these words; don't paraphrase or invent marketing copy. Bracketed italics in that file are build notes, not copy.
2. The logo SVG placed in this repo (the flying-f mark). Treat it as possibly a placeholder to be swapped for a polished version later — reference it by path, don't hardcode its geometry.

Then confirm the dev port (should be 5173) and list what you plan to build before writing files.

---

## Stack & principles

- Vite + React (the app already started). Use React Router for routes.
- Styling: Tailwind (or CSS variables) driven by the design tokens below. **Define tokens once and reuse** — no one-off inline colors. This matters because Course pages will inherit this system later.
- **Single page** for launch. Nav items are **smooth-scroll anchors** to sections on this page — *except* Log in and Start free, which are real actions (auth). Build the page so it stands on its own as marketing even if auth is mid-wire.
- Mobile-first, fully responsive. This audience reads on phones.
- Accessible: semantic HTML, alt text, ADA-contrast, and honor `prefers-reduced-motion`.
- Build reusable section components (Hero, FeatureBand, PricingCard, FAQItem, etc.) — not one giant file.

---

## Design system (do NOT use default beige/gray — this is the anti-generic guardrail)

**Colors (tokens):**
```
--color-primary:       #059669   /* emerald — brand */
--color-primary-dark:  #047857   /* hover, links, text-on-light */
--color-primary-light: #10B981   /* accent/highlight */
--color-accent-brick:  #852525   /* Forest Hearth */
--color-accent-brown:  #662B00   /* Forest Hearth */
--color-accent-camel:  #E6A373   /* Forest Hearth — light, use as a warm band bg */
--color-ink:           #17231D   /* body text: very dark warm green-charcoal */
--color-muted:         #5B665F   /* secondary text */
--color-bg:            #FCFCFB   /* page background: clean near-white, NOT beige */
--color-surface:       #FFFFFF   /* cards */
--color-border:        #E8E8E2   /* hairlines */
```
Alternating section-band tints (Fluent Forever style — pale, not saturated): pale emerald `#F0FAF6`, pale warm tan `#FBF3EA`, white, pale brick `#FBF1F0`. Cycle these down the page so it never reads as a wall of white cards.

**Typography:** Headings in **Outfit** (geometric sans — harmonizes with the monoline logo), weights 500–700. Body in **Inter**, 400–500. Load via Google Fonts or self-host. Two-tone headings where noted (accent phrase in emerald/brick/brown, rest in `--color-ink`), like the Fluent Forever reference.

**Feel:** generous whitespace, intentional asymmetry, one accent color per band, subtle hover transitions on buttons/cards. It should read as human-designed and deliberate — not a templated default.

---

## Logo usage
Use the SVG mark in the header (with "Forever Funded" wordmark beside it), in the hero resolved-state, and in the footer. Generate a favicon from it. Keep the mark as a referenced asset so a polished version can drop in without code changes.

---

## Sections (order + layout; words come from the copy deck)

Follow the copy deck's numbered sections. Layout notes per section:

1. **Header** — logo + wordmark left; anchor nav (How it works · What it checks · Pricing · FAQ); **Log in** (ghost) and **Start free** (emerald) right. Sticky on scroll, subtle shadow after scroll.
2. **Hero** — headline + subhead + primary CTA + "No credit card required" + secondary demo link, beside the two-state visual (see Hero Animation below).
3. **See it work** — Loom embed placeholder on one side; a still before/after + "See a full sample report (PDF) →" (link to a placeholder PDF path for now).
4. **How it works** — 3 numbered steps, horizontal on desktop / stacked on mobile.
5. **What the Coach checks** — two "envelope" cards: **22 Do's** and **26 Don'ts**, big number leading each (echo the ∞ pricing treatment).
6. **Features** — 4 alternating-background bands, two-tone headings, each paired with an illustration placeholder. Forest Hearth accents.
7. **Fits your workflow** — logo row (placeholder logos: Mailchimp, Kit, MailerLite, Constant Contact, Flodesk, Epistle, Gmail, Outlook), with the "works with any email tool" line.
8. **Your report** — the legend rendered exactly: ✅ good · 🟠 worth considering · 🔴 needs fixing — plus "See a full sample report (PDF) →".
9. **Security & privacy** — the four promises as a clean list; link to /privacy (stub page ok).
10. **Founder story** — text + optional photo placeholder. Consider pulling "The email is the relationship." as a large quote.
11. **Pricing** — see Pricing Layout below.
12. **FAQ** — accordion (expand/collapse), the Q&As from the copy.
13. **Course teaser** — two-up cards (Email Coach = live; Course = "coming soon" + email capture), styled like Fluent Forever's App/Coaching split.
14. **Final CTA** — heading + line + primary CTA.
15. **Footer** — link columns (Product / Company / Legal), email capture, tagline. Include /privacy and /terms links (stub pages fine for now).

---

## Hero animation (the "swipe")

- **Default / resolved state = the flying-f logo, calm.** This is also the reduced-motion and no-JS fallback — the hero must look finished with zero animation.
- On scroll-into-view (IntersectionObserver), **play once** (not a loop): the sweating-hand-over-SEND illustration is swept off as the flying-f glides in and settles. Plain CSS transitions on two layered SVGs — no heavy animation libs.
- **`prefers-reduced-motion: reduce`** → skip the animation, show the resolved state only.
- **Local-dev placeholder for the stress illustration:** use the Mailchimp nervous gif **only on localhost** — do NOT ship it to the deployed site. Leave a clearly-marked TODO to swap in an original emerald sweating-hand illustration before the site goes public.

---

## Pricing layout

Three columns, **no monthly/annual toggle**. Big symbol atop each: **10 / ∞ / ∞**.
- **Free:** tinted background + gray border. Show `~~3~~ 10 credits` with a "Launch bonus" tag. CTA: **Start your free trial** — "No credit card required."
- **Monthly $19/mo:** white bg + black border. ∞. CTA: **Get unlimited coaching**.
- **Annual $97/yr:** white bg + black border + **"Most Popular"** ribbon, visually emphasized. ∞. Show **"just $8/mo"** under the price (anchors against monthly). "+$50 off the Course." CTA: **Get unlimited coaching**.
- Below the cards, the ROI line from the copy.
- Paid CTAs can point to a placeholder/checkout-coming route for now (Stripe wiring is post-launch).

---

## Auth wiring (magic link — verified working)

Supabase magic-link auth is configured and tested. Wire the client flow:

- **Client:** `@supabase/supabase-js`, initialized with env vars:
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only — it's public and RLS-gated; **never** the service role key). Put them in `.env` (gitignored) and read via `import.meta.env`.
- **Start free** and **Log in** both open one auth component (email field): call `signInWithOtp({ email, options: { emailRedirectTo } })`, then show a "Check your inbox" state. (Magic link doubles as signup, so both entry points share this.)
- **`emailRedirectTo`** = `${window.location.origin}/auth/callback`.
- **Route `/auth/callback`:** let supabase-js detect the session from the URL, then redirect to `/profile`.
- **Route `/profile`:** protected (redirect to home if not signed in). **Keep it minimal for launch** — a signed-in welcome plus a note that their personal review address arrives by email. (The full portal — live review address, remaining credits, history — is the v2 build and will query the profiles/reviews tables, which aren't applied yet. Don't couple this page to the current v1 schema.)
- Sign-out button on /profile.

**Redirect URLs Brett must add in Supabase → URL Configuration** (tell him to add these): `http://localhost:5173/auth/callback` and `https://foreverfunded.org/auth/callback`. Site URL: `https://foreverfunded.org`.

---

## Cloudflare Pages

- Ensure the build works as a Pages deployment: standard Vite build (`npm run build` → `dist`), SPA routing fallback so client routes (`/profile`, `/auth/callback`) resolve (add a `_redirects` with `/* /index.html 200`).
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) set in the Pages project settings, not committed.
- Don't deploy yet unless asked — get it building and running locally first.

---

## Placeholders to leave clearly marked
- Loom embed (Section 3)
- Sample report PDF link (Sections 3 & 8)
- Fits-your-workflow logos (Section 7)
- Founder photo (Section 10)
- Hero stress illustration (local gif now; original art before public)
- /privacy and /terms stub pages

---

## Report back when done
- The dev port in use (for the Supabase redirect allow-list).
- The redirect URLs Brett needs to add in Supabase.
- What env vars to set and where.
- Anything you stubbed or assumed, and what remains before it can go public.
