# Addendum — Part D: Continue the Conversation (placement + UI decisions)

**Supersedes the placement assumptions in Part D of
`profile-reports-phase-build-spec.md`.** Everything else in that spec (schema,
Worker endpoint, guardrails, non-durable-profile rule) stands as written — this
addendum only changes *where and how* chat is surfaced in the UI.

---

## The problem this solves

Chat living only at the bottom of an opened report is a real mobile
discoverability failure — a long scroll away, easy to miss, and disconnected from
the Reports list where users actually decide what to do next.

## The decision

**One shared dialog per report, with two segments — "Report" and "Conversation"
— switchable by a tap at the top, no scrolling required to reach either.**

### A. Reports list — three actions per completed review, not two

Add a third icon alongside the existing View and Download:

**View · Talk to Coach · Download**

Both **View** and **Talk to Coach** open the *same* dialog for that review. They
differ only in which segment is active on open:
- **View** → opens with the **Report** segment active.
- **Talk to Coach** → opens with the **Conversation** segment active.

This means a user mid-conversation can flip back to the Report segment in one tap
to re-read what they're asking about, and a user reading the report can flip to
Conversation without closing anything and reopening a different control. No long
scroll in either direction.

### B. Dialog title

**No title for the dialog container itself** — the Report | Conversation toggle
(section C) already makes clear what's being viewed, so a separate container
title would be redundant.

**"Talk to Coach about this report"** is instead the title for the
**Conversation segment specifically** — shown only when that segment is active.
Works identically on the very first open (zero messages) and after a long
back-and-forth. The Report segment doesn't need its own title beyond the toggle
itself (or can reuse the report's subject line if a heading is needed there).

### C. Segment control

A simple two-item toggle/tabs at the top of the dialog, below the title:
**Report | Conversation**. Keep it lightweight (not a full second navigation
level) — this is a switch within one dialog, not two separate pages.

### D. Email hint (report emails only — additive, not a replacement for A–C)

Add a short line near the bottom of the emailed report (above or near the
existing sign-off), pointing readers back to the portal:

> Want to talk to Coach about this report? Use the Reports tab in your account.

This serves a different discovery moment than the in-app icons — people who only
ever read the report in their inbox and wouldn't otherwise think to revisit the
site. Additive to A–C, not a substitute.

---

## What does NOT change from the original Part D spec

- Schema (`review_messages` table + RLS), Worker chat endpoint, ownership
  verification via RLS, the Coach's non-defensive conversational guardrail, the
  soft per-report turn cap, and the **v1 rule that chat writes nothing durable to
  the profile** — all unchanged, build exactly as originally specified.
- Targeted find-and-replace only in Worker files; migration via SQL Editor
  wrapped in BEGIN;/COMMIT;, handed over for Brett to run — unchanged.

---

## Verification additions

- From the Reports list: **View** opens the dialog on the Report segment;
  **Talk to Coach** opens the same dialog on the Conversation segment.
- Switching segments inside the dialog requires no scrolling and preserves
  scroll position / state on each segment independently.
- The dialog container itself has no title; the Report | Conversation toggle is
  the only wayfinding needed. "Talk to Coach about this report" appears as the
  Conversation segment's own heading — present on first open (no messages yet)
  and after multiple turns — and does not appear on the Report segment.
- The email hint line appears on report emails and the wording matches above.
