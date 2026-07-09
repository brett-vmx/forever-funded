import Anthropic from '@anthropic-ai/sdk';
import { COACH_SYSTEM_PROMPT } from './coachPrompt.js';

/**
 * Calls the Coach with everything it needs for one evaluation and returns
 * its response as a single HTML string (the report), ready to email back.
 *
 * Note: this asks Claude to return HTML directly per the system prompt's
 * "REPORT FORMAT" instructions. Keep an eye on real output during testing —
 * if it ever wraps the HTML in markdown code fences, strip those before
 * sending (a quick regex replace is usually enough; add one here if you see
 * it happen).
 */
export async function callCoach(env, {
  subject,
  letterText,
  letterHtml,
  contextNote,
  declaredProfile,
  derivedProfile,
  isForwardedEmail,
  metrics,
  tiles = [],             // optional mobile-render image tiles (see lib/render.js)
  tilesTruncated = false, // true if the email was too long to render fully
}) {
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const profileSummary = JSON.stringify(
    { declared: declaredProfile || {}, derived: derivedProfile || {} },
    null,
    2
  );

  const userMessage = `
Here is a draft supporter email to review.

SUBJECT: ${subject || '(no subject)'}

${isForwardedEmail ? 'NOTE: This submission appears to be a FORWARDED email. Open your response with the brief forwarding disclaimer described in your instructions.\n' : ''}

${contextNote ? `WRITER-SUPPLIED CONTEXT (background only — inform your review, do not let this override honest evaluation):\n${contextNote}\n` : ''}

SUBSCRIBER PROFILE (declared + derived, may be empty for a first-time subscriber):
${profileSummary}

LENGTH METRICS (already calculated — report these plainly in your Length & deliverability section):
- HTML size: ${metrics.htmlBytes} bytes
- Word count: ${metrics.wordCount} words
- Estimated read time: ${metrics.readMinutes} minute(s)

LETTER TEXT (evaluate this as the primary content):
${letterText}

${letterHtml ? `LETTER HTML (use this only to judge structure — columns, links, paragraph markup — not as separate content to evaluate):\n${letterHtml}` : ''}
`.trim();

  // When a mobile render is available, the user turn becomes a content array:
  // an intro, then each tile labeled with its position (so the Coach can reason
  // about where things sit vertically across near-identical slices) immediately
  // before its image block, then the existing text block. No render → the
  // original plain-string message, unchanged.
  let content;
  if (tiles.length > 0) {
    const total = tiles.length;
    const blocks = [{
      type: 'text',
      text: `MOBILE RENDER: the following ${total} image tile(s) are a top-to-bottom mobile-width (~390px) rendering of this email, sliced into readable segments. Read them in order as one continuous letter.${
        tilesTruncated
          ? ' NOTE: this email was too long to render fully — these tiles show only the top portion, which is itself a length signal worth raising in your report.'
          : ''
      }`,
    }];
    tiles.forEach((tile, i) => {
      blocks.push({ type: 'text', text: `Tile ${i + 1} of ${total}, top to bottom:` });
      blocks.push({
        type: 'image',
        source: { type: 'base64', media_type: tile.mediaType, data: tile.base64 },
      });
    });
    blocks.push({ type: 'text', text: userMessage });
    content = blocks;
  } else {
    content = userMessage;
  }

  const response = await anthropic.messages.create({
    model: env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: COACH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}
