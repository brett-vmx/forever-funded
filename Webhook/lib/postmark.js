// Sending via Postmark's REST API directly with fetch. The `postmark` npm
// package is built on Node-specific HTTP plumbing that isn't reliable in the
// Cloudflare Workers runtime — but the package is just a thin wrapper around
// this same https://api.postmarkapp.com/email endpoint, so calling it
// directly sends the exact same email.

async function postmarkSend(env, message) {
  const resp = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': env.POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify(message),
  });

  if (!resp.ok) {
    // Postmark returns a JSON body explaining the failure (e.g. unverified
    // sender, bad token). Surface it so the Worker log shows the real cause.
    const detail = await resp.text();
    throw new Error(`Postmark send failed (HTTP ${resp.status}): ${detail}`);
  }
}

/**
 * Sends the finished coaching report to the subscriber's REGISTERED account
 * email — never back to whatever address the submission arrived from,
 * since ESP test-sends often come from a platform address, not the
 * subscriber's own inbox.
 */
export async function sendReport(env, { toEmail, originalSubject, reportHtml }) {
  await postmarkSend(env, {
    From: `Forever Funded Coach <${env.FROM_EMAIL}>`,
    To: toEmail,
    Subject: `Here's your report on "${originalSubject || 'your draft'}"`,
    HtmlBody: addChatHint(reportHtml),
    MessageStream: 'outbound', // adjust if you named your transactional stream differently
  });
}

/**
 * Additive to the emailed copy only (part-d-chat-addendum.md) — points
 * readers who only ever see the report in their inbox back to the portal's
 * Reports tab, where View / Talk to Coach / Download now live. Not applied to
 * the stored report_body itself, so the in-app view and PDF download stay
 * exactly as generated.
 *
 * Styled as a callout box matching the same left-border + tinted-background
 * structural pattern as the forwarded-email note (see reportTemplate.js's
 * `.ff-note` class), in the brand green instead of that box's tan/olive.
 * Uses fully inline styles rather than a shared CSS class: this gets
 * appended after the document's own <style> block already exists, and many
 * email clients strip <style> blocks anyway (same reasoning as the PDF's
 * inline-styled referral footer in api/report-pdf.js).
 *
 * Inserted INSIDE reportTemplate.js's `.ff-report` container (before its
 * closing </div>, not after it) so it inherits that container's left/right
 * padding and font-family — same alignment and font as the rest of the
 * report — rather than sitting flush against the page edge in a fallback
 * font, which is what appending after </div> would do.
 */
function addChatHint(reportHtml) {
  const hint = `
    <div style="margin-top:24px; padding:12px 16px; background:#f0faf6; border-left:3px solid #059669; border-radius:3px;">
      <p style="margin:0 0 4px; font-weight:700; color:#1a1a1a;">Talk to Coach</p>
      <p style="margin:0; color:#1a1a1a;">Want to talk to Coach about this report? Use the Reports tab in your account.</p>
    </div>`;
  return /<\/div>\s*<\/body>/i.test(reportHtml)
    ? reportHtml.replace(/<\/div>(\s*)<\/body>/i, (_match, trailingSpace) => `${hint}\n  </div>${trailingSpace}</body>`)
    : reportHtml.replace('</body>', `${hint}</body>`);
}

/**
 * Sent instead of a report when a trial subscriber has used up their
 * "1 free email + 2 revisions" allowance. Keep this warm, not a bare
 * paywall notice — it's still a touchpoint with someone who liked the
 * product enough to hit the limit.
 */
/**
 * Sent once, right after a v2 signup provisions a profile (see
 * db/migrations/0002_profiles_reviews.sql's handle_new_user trigger). Gives
 * the person the one thing they need to actually use the product: their
 * unique review address.
 */
export async function sendWelcomeEmail(env, { toEmail, reviewAddress }) {
  await postmarkSend(env, {
    From: `Forever Funded Coach <${env.FROM_EMAIL}>`,
    To: toEmail,
    Subject: 'Your Email Coach is ready',
    HtmlBody: `
      <p>Hi there,</p>
      <p>Your Forever Funded Email Coach is ready to go! Send any draft
      supporter email to this personal review email address below, and
      you'll get a full report back in a couple of minutes:</p>
      <p><strong>${reviewAddress}</strong></p>
      <p>Warmly,<br>The Forever Funded Team</p>
    `,
    MessageStream: 'outbound',
  });
}

export async function sendTrialLimitEmail(env, { toEmail }) {
  await postmarkSend(env, {
    From: `Forever Funded Coach <${env.FROM_EMAIL}>`,
    To: toEmail,
    Subject: "You've used your free Email Coach reviews",
    HtmlBody: `
      <p>Hi there,</p>
      <p>You've used up your free trial email reviews with our Forever Funded
      Email Coach. We hope you saw your email drafts improve!</p>
      <p>Ready for unlimited reviews? <a href="https://foreverfunded.org/coach">
      Upgrade here</a> to keep sending your drafts to our Email Coach before
      every send.</p>
      <p>Warmly,<br>The Forever Funded Team</p>
    `,
    MessageStream: 'outbound',
  });
}
