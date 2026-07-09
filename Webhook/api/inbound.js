// api/inbound.js — Postmark's Inbound stream POSTs the parsed email here as
// JSON. This is the whole pipeline: identify the subscriber, check their
// quota, evaluate the letter with the Coach, store everything, and email
// back the report.
//
// Deploy note (Cloudflare Workers): this file is the Worker's entry point
// (see wrangler.toml `main`). Once deployed, the endpoint is
// https://<worker-name>.<your-subdomain>.workers.dev/api/inbound — that full
// URL is what goes in Postmark's "inbound webhook URL" field (Server >
// Message Streams > Default Inbound Stream).
//
// Workers pass configuration/secrets on the `env` argument of fetch() —
// there is no process.env. Secrets are set with `wrangler secret put`;
// non-secret values live in wrangler.toml under [vars].

import {
  extractToken,
  isForwarded,
  splitContext,
  countWords,
  estimateReadMinutes,
  htmlByteSize,
} from '../lib/email.js';

import {
  getSubscriberByToken,
  saveSubmission,
  saveReport,
  incrementReviewUsage,
  getProfileBySlug,
  canRequestReview,
  insertReceivedReview,
  markReviewProcessing,
  completeReview,
  failReview,
} from '../lib/supabase.js';

import { callCoach } from '../lib/anthropic.js';
import { sendReport, sendTrialLimitEmail, sendWelcomeEmail } from '../lib/postmark.js';
import { wrapReportWithStyles, promoteForwardedNote } from '../lib/reportTemplate.js';
import { shouldRender, renderEmailTiles } from '../lib/render.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Fired by a Supabase Database Webhook on `profiles` INSERT (see
    // db/migrations/0002_profiles_reviews.sql's handle_new_user trigger,
    // which is what actually creates the row this webhook reacts to).
    // Separate from /api/inbound because it's a different sender (Supabase,
    // not Postmark) with a different payload shape and its own auth check.
    if (url.pathname === '/hooks/new-profile') {
      return handleNewProfileHook(request, env);
    }

    if (url.pathname !== '/api/inbound') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
      // Postmark sends the full parsed email as the JSON request body.
      // Key fields we use: Subject, TextBody, HtmlBody, To (the recipient —
      // this is where the subscriber's token lives).
      const payload = await request.json();
      const { Subject: subject, TextBody: textBody, HtmlBody: htmlBody } = payload;

      // --- 1. Identify the subscriber from the recipient address ---
      // IMPORTANT: use ToFull (an array of every recipient), NOT the raw To
      // string. A missionary's ESP test-send commonly goes to themselves AND
      // their review address in one send, so To contains multiple addresses —
      // we must find the one on OUR review domain, not just the first one.
      const reviewDomain = (env.REVIEW_DOMAIN || 'review.foreverfunded.org').toLowerCase();
      const recipients = Array.isArray(payload.ToFull) ? payload.ToFull : [];
      const reviewRecipient = recipients.find(
        (r) => r.Email && r.Email.toLowerCase().endsWith('@' + reviewDomain)
      );

      const token = reviewRecipient
        ? extractToken(reviewRecipient.Email)
        : extractToken(payload.To); // fallback for odd payloads

      if (!token) {
        console.error('Could not extract a token from recipients:', payload.To);
        return Response.json({ ok: true, note: 'no token found, ignored' });
        // Respond 200 either way — Postmark retries on non-2xx responses, and
        // a malformed/unrecognized address isn't something retrying will fix.
      }

      // v2 (profiles/reviews) is tried first; any slug that isn't a v2
      // profile falls through to the v1 (subscribers) path below, so
      // existing subscribers keep working unchanged for as long as both
      // schemas coexist. Caught defensively: if the v2 lookup itself fails
      // (e.g. the profiles table/migration isn't live yet, or a transient
      // DB hiccup), that must NOT take down v1 traffic — fall through to
      // the v1 lookup instead of 500ing every inbound email.
      let profile = null;
      try {
        profile = await getProfileBySlug(env, token);
      } catch (err) {
        console.error('v2 profile lookup failed, falling back to v1:', err);
      }
      if (profile) {
        return handleV2Submission(env, payload, profile, { subject, textBody, htmlBody });
      }

      const subscriber = await getSubscriberByToken(env, token);
      if (!subscriber) {
        console.error('No subscriber found for token:', token);
        return Response.json({ ok: true, note: 'unknown token, ignored' });
      }

      // --- 2. Check trial/quota status BEFORE calling the Coach ---
      // (No point spending an API call on a submission we won't deliver.)
      if (subscriber.status === 'trial' && subscriber.reviews_used >= subscriber.reviews_limit) {
        await sendTrialLimitEmail(env, { toEmail: subscriber.email });
        return Response.json({ ok: true, note: 'trial limit reached, upgrade email sent' });
      }
      // TODO: also handle status === 'expired' (a lapsed paid subscription)
      // the same way, once billing/subscription-expiry logic exists.

      // --- 3. Parse the email: forward detection, context delimiter ---
      const forwardedEmail = isForwarded(subject, textBody);
      const { context, letter } = splitContext(textBody);

      // --- 4. Compute length/deliverability metrics (deterministic, not AI) ---
      const metrics = {
        htmlBytes: htmlByteSize(htmlBody),
        wordCount: countWords(letter),
        readMinutes: estimateReadMinutes(countWords(letter)),
      };

      // --- 5. Store the submission ---
      const submissionId = await saveSubmission(env, {
        subscriberId: subscriber.id,
        subject,
        text: letter,
        html: htmlBody,
        contextNote: context,
        isForwardedEmail: forwardedEmail,
      });

      // --- 6. Call the Coach ---
      const coachHtml = await callCoach(env, {
        subject,
        letterText: letter,
        letterHtml: htmlBody,
        contextNote: context,
        declaredProfile: subscriber.declared_profile,
        derivedProfile: subscriber.derived_profile,
        isForwardedEmail: forwardedEmail,
        metrics,
      });

      // --- 7. Apply the report's visual styling ---
      // The Coach returns bare semantic HTML (see coachPrompt.js's "OUTPUT
      // FORMAT" rules); this wraps it in the one consistent look defined in
      // lib/reportTemplate.js. When the submission was forwarded, the
      // Coach's opening disclaimer gets promoted to the styled callout
      // instead of staying plain body text.
      const noteStyledHtml = promoteForwardedNote(coachHtml, forwardedEmail);
      const reportHtml = wrapReportWithStyles(noteStyledHtml);

      // --- 8. Store the report ---
      await saveReport(env, { submissionId, reportHtml, reportText: reportHtml });

      // --- 9. Send the report to the subscriber's REGISTERED email ---
      await sendReport(env, {
        toEmail: subscriber.email,
        originalSubject: subject,
        reportHtml,
      });

      // --- 10. Increment usage ---
      await incrementReviewUsage(env, subscriber.id, subscriber.reviews_used);

      return Response.json({ ok: true });
    } catch (err) {
      // Log the full error for debugging, but don't leak internals to Postmark.
      console.error('Inbound webhook error:', err);
      // Returning 500 here causes Postmark to retry — reasonable for a
      // transient failure (e.g. Anthropic API hiccup), but if you see the
      // SAME submission repeatedly failing, that's a bug to fix, not
      // something retries will resolve. Check Postmark's Activity log and
      // the Worker's logs (Cloudflare dashboard > your Worker > Logs, or
      // `wrangler tail`) if reports seem to be going missing.
      return Response.json({ error: 'Internal error processing submission' }, { status: 500 });
    }
  },
};

/**
 * v2 pipeline (profiles/reviews). Mirrors the v1 pipeline above step for
 * step, with two differences: the review row IS the quota reservation (no
 * separate increment call), and postmark_message_id dedupe makes a retried
 * delivery a safe no-op instead of a double-charged credit.
 */
async function handleV2Submission(env, payload, profile, { subject, textBody, htmlBody }) {
  try {
    const messageId = payload.MessageID || null;

    const ok = await canRequestReview(env, profile.id);
    if (!ok) {
      await sendTrialLimitEmail(env, { toEmail: profile.email });
      return Response.json({ ok: true, note: 'quota/window exhausted, upgrade email sent' });
    }

    const forwardedEmail = isForwarded(subject, textBody);
    const { context, letter } = splitContext(textBody);
    const metrics = {
      htmlBytes: htmlByteSize(htmlBody),
      wordCount: countWords(letter),
      readMinutes: estimateReadMinutes(countWords(letter)),
    };

    // Reserves the quota slot. Returns null if this postmark_message_id was
    // already inserted — i.e. Postmark retried a delivery we already
    // handled. Treat that as an already-completed no-op: do NOT re-run the
    // Coach, re-send the report, or touch the credit count a second time.
    const reviewId = await insertReceivedReview(env, {
      userId: profile.id,
      postmarkMessageId: messageId,
      fromEmail: payload.From,
      subject,
      wordCount: metrics.wordCount,
      draftBody: letter,
    });
    if (reviewId === null) {
      return Response.json({ ok: true, note: 'duplicate delivery, already handled' });
    }

    await markReviewProcessing(env, reviewId);

    // Mobile visual render (v2 only, soft-rollout gated by RENDER_ALLOWLIST).
    // renderEmailTiles never throws — it returns empty tiles on failure or when
    // disabled, so the Coach call transparently falls back to text-only. Runs
    // AFTER the dedupe insert so a Postmark retry short-circuits above and never
    // spends a render.
    let tiles = [];
    let tilesTruncated = false;
    if (shouldRender(env, profile.email)) {
      const rendered = await renderEmailTiles(env, htmlBody);
      tiles = rendered.tiles;
      tilesTruncated = rendered.truncated;
      console.log(`render: ${tiles.length} tile(s)${tilesTruncated ? ' (truncated)' : ''} for slug ${profile.review_slug}`);
    }

    let coachHtml;
    try {
      coachHtml = await callCoach(env, {
        subject,
        letterText: letter,
        letterHtml: htmlBody,
        contextNote: context,
        declaredProfile: {},
        derivedProfile: {},
        isForwardedEmail: forwardedEmail,
        metrics,
        tiles,
        tilesTruncated,
      });
    } catch (err) {
      // Failing releases the quota slot (remaining_reviews excludes
      // status='failed') so a Coach/API hiccup doesn't cost a real credit.
      await failReview(env, reviewId, err);
      throw err;
    }

    const noteStyledHtml = promoteForwardedNote(coachHtml, forwardedEmail);
    const reportHtml = wrapReportWithStyles(noteStyledHtml);

    // Record render outcome in flags — gives durable per-review visibility into
    // how often/how much rendering happened, for soft-rollout cost/quality
    // monitoring (0 tiles = text-only for this review).
    await completeReview(env, reviewId, {
      reportBody: reportHtml,
      flags: { render_tiles: tiles.length, render_truncated: tilesTruncated },
    });

    await sendReport(env, {
      toEmail: profile.email,
      originalSubject: subject,
      reportHtml,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('v2 inbound webhook error:', err);
    return Response.json({ error: 'Internal error processing submission' }, { status: 500 });
  }
}

/**
 * Handles the Supabase Database Webhook fired on `profiles` INSERT (the
 * handle_new_user trigger in the migration creates that row at signup).
 * Authenticated with a shared secret header, since this endpoint is public
 * and otherwise anyone could trigger a welcome-email send to any address.
 */
async function handleNewProfileHook(request, env) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const providedSecret = request.headers.get('x-webhook-secret');
  if (!env.SUPABASE_WEBHOOK_SECRET || providedSecret !== env.SUPABASE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const record = payload.record || {};
    const { email, review_slug: reviewSlug } = record;

    if (!email || !reviewSlug) {
      console.error('new-profile hook: missing email or review_slug on record:', record);
      return Response.json({ ok: true, note: 'missing email/slug, ignored' });
    }

    const reviewDomain = env.REVIEW_DOMAIN || 'review.foreverfunded.org';
    await sendWelcomeEmail(env, {
      toEmail: email,
      reviewAddress: `${reviewSlug}@${reviewDomain}`,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('new-profile hook error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
