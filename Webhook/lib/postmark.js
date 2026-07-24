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
 */
function addChatHint(reportHtml) {
  const hint = `
    <p style="margin-top:24px; font-size:14px; color:#666666;">
      Want to talk to Coach about this report? Use the Reports tab in your account.
    </p>`;
  return reportHtml.includes('</body>')
    ? reportHtml.replace('</body>', `${hint}</body>`)
    : reportHtml + hint;
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
