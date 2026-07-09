# Forever Funded

Product for ministry workers who write supporter update emails: an AI **Email
Coach** (live) and a future **Course**. This repo holds the marketing site
(`Website/`), the Coach backend (`Webhook/`), and Course material (`Course/`).

## Copy style (production-facing text)

Applies to all user-visible copy: the landing page, transactional emails, the
Coach's generated reports, and any marketing text. NOT code comments.

- **Never use em dashes (—) in production copy.** They read as AI-written, which
  undermines a product whose whole promise is helping people sound like
  themselves. Rewrite with a comma, period, colon, or parentheses, and prefer
  restructuring the sentence over a mechanical one-for-one swap. En dashes in
  number ranges (e.g. "3–4 pages") are fine.
- Write like a seasoned ministry mentor talking to a peer: warm, plain,
  specific. Avoid other AI tells too — hedging ("it's worth noting"), inflated
  transitions ("moreover", "furthermore"), and tricolon overload.
- Match the voice already in `Website/forever-funded-coach-landing-copy.md` and
  the framework docs.

## Dev

- Website dev server runs on port **5173** (`cd Website && npm run dev`), pinned
  via `.claude/launch.json`. Secrets live in gitignored `Website/.env`.
