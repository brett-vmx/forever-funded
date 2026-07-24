// api/report-chat.js — POST /api/report-chat: continues a conversation with
// the Coach about one past report ("why did you flag that?", request a
// rewrite, etc.), in the same voice as the original report but without its
// strict HTML output contract (see lib/coachChatPrompt.js).
//
// Authorization is RLS, same pattern as report-pdf.js: the initial review
// lookup uses the CALLER's own access token, so a review_id belonging to
// someone else returns no row — indistinguishable from a nonexistent one.
// Prior turns and the new turn are then read/written with the service-role
// wrappers in lib/supabase.js, since review_messages has no client insert
// policy (db/migrations/0011_review_messages.sql) — same division of labor
// the rest of the pipeline uses: RLS for reads a user is allowed, service
// role for writes.
//
// v1 rule (profile-reports-phase-build-spec.md Part D4): this endpoint never
// writes to profiles. Nothing said here becomes a durable fact about the
// writer — only this review's own conversation record.

import { callCoachChat } from '../lib/anthropic.js';
import { getUserClient, getReviewMessages, insertReviewMessages } from '../lib/supabase.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Soft cap on total stored turns (both roles) per report — generous; normal
// back-and-forth never gets near it. Bounds Anthropic spend on any one
// review, since every turn resends the full history (stateless rebuild).
const MAX_MESSAGES_PER_REVIEW = 60;
const MAX_MESSAGE_LENGTH = 4000;

export async function handleReportChat(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const authHeader = request.headers.get('Authorization') || '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    let reviewId, message;
    try {
      ({ review_id: reviewId, message } = await request.json());
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
    }
    if (!reviewId) {
      return Response.json({ error: 'review_id required' }, { status: 400, headers: CORS_HEADERS });
    }
    message = typeof message === 'string' ? message.trim() : '';
    if (!message) {
      return Response.json({ error: 'message required' }, { status: 400, headers: CORS_HEADERS });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json({ error: 'message is too long' }, { status: 400, headers: CORS_HEADERS });
    }

    const supabase = getUserClient(env, accessToken);
    const { data: review, error } = await supabase
      .from('reviews')
      .select('user_id, subject, draft_body, report_body, status')
      .eq('id', reviewId)
      .maybeSingle();

    if (error) {
      console.error('report-chat: review lookup failed:', error);
      return Response.json({ error: 'Lookup failed' }, { status: 500, headers: CORS_HEADERS });
    }
    // No row = either it doesn't exist, or RLS just hid someone else's row —
    // same response either way, which is the point (see report-pdf.js).
    if (!review || !review.report_body) {
      return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
    }

    const history = await getReviewMessages(env, reviewId);
    if (history.length >= MAX_MESSAGES_PER_REVIEW) {
      return Response.json(
        {
          reply:
            "We've covered a lot of ground on this one! To keep things focused, let's leave the conversation here — send a fresh draft to your review address any time for a new report.",
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const contextBlock = `
CONTEXT FOR THIS CONVERSATION — you already reviewed this writer's letter and
sent them the report below. They are now following up with a question or
comment about it. Stay in character as their Coach.

SUBJECT: ${review.subject || '(no subject)'}

THE ORIGINAL LETTER:
${review.draft_body || '(not available)'}

YOUR REPORT (already sent to the writer):
${htmlToPlainText(review.report_body)}
`.trim();

    const messages = [
      { role: 'user', content: contextBlock },
      {
        role: 'assistant',
        content: "Got it — I have the letter and my report in front of me. What's on your mind?",
      },
      ...history.map((row) => ({ role: row.role, content: row.content })),
      { role: 'user', content: message },
    ];

    const reply = await callCoachChat(env, { messages });

    // Store both turns together, only after a reply actually succeeds, so a
    // failed Anthropic call never leaves an unanswered question sitting in
    // history (which would also break strict user/assistant alternation on
    // the next turn).
    await insertReviewMessages(env, [
      { review_id: reviewId, user_id: review.user_id, role: 'user', content: message },
      { review_id: reviewId, user_id: review.user_id, role: 'assistant', content: reply },
    ]);

    return Response.json({ reply }, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('report-chat error:', err);
    return Response.json(
      { error: 'Internal error continuing the conversation' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

/**
 * report_body is a complete styled HTML document (see reportTemplate.js).
 * Stripped to plain text here so repeated stateless rebuilds of the
 * conversation don't keep re-billing tokens for its <style> block and markup
 * on every single turn.
 */
function htmlToPlainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
