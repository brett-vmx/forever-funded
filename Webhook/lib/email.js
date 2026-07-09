// Small, pure helper functions for parsing the inbound email. Kept separate
// from api/inbound.js so each piece is easy to test on its own with sample
// strings, without needing a real Postmark payload.

/**
 * Given a raw "To" field like "Some Name <7k92mx@review.foreverfunded.org>"
 * or just "7k92mx@review.foreverfunded.org", return the lowercase localpart
 * ("7k92mx"), or null if it doesn't look like a valid address.
 *
 * We match on the recipient (not the sender) because ESP test-sends often
 * come FROM a platform address like "...@mailchimpapp.com" — the token in
 * the TO address is the one thing that's reliably the subscriber's own.
 */
export function extractToken(toField) {
  if (!toField) return null;
  const match = toField.match(/<?([a-zA-Z0-9._-]+)@[^>]+>?/);
  if (!match) return null;
  return match[1].toLowerCase();
}

/**
 * Deterministic forward detection — never ask the model to guess this.
 * Checks the two most common signals: an Fwd:/FW: subject prefix, and the
 * "---------- Forwarded message ----------" divider Gmail (and most clients)
 * insert into the body.
 */
export function isForwarded(subject, textBody) {
  const subjectLooksForwarded = /^\s*(fwd|fw)\s*:/i.test(subject || '');
  const bodyHasDivider = /-{5,}\s*forwarded message\s*-{5,}/i.test(textBody || '');
  return subjectLooksForwarded || bodyHasDivider;
}

/**
 * Splits writer-supplied context from the actual letter using the
 * "--- COACH CONTEXT ---" delimiter convention (see framework doc,
 * "Writer-supplied context"). Everything above the line is background for
 * the Coach; everything below is the letter to evaluate.
 *
 * If the delimiter isn't present, the whole body is treated as the letter
 * and context is null.
 */
export function splitContext(textBody) {
  if (!textBody) return { context: null, letter: '' };

  const delimiterPattern = /-{2,}\s*coach context\s*-{2,}/i;
  const match = textBody.match(delimiterPattern);

  if (!match) {
    return { context: null, letter: textBody.trim() };
  }

  const splitIndex = match.index + match[0].length;
  const context = textBody.slice(0, match.index).trim();
  const letter = textBody.slice(splitIndex).trim();

  return { context: context || null, letter };
}

/** Rough word count — good enough for a read-time estimate, not precise typesetting. */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimated read time in whole minutes, using ~220 wpm as a middle-of-the-range estimate. */
export function estimateReadMinutes(wordCount) {
  const WORDS_PER_MINUTE = 220;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

/** Byte size of the HTML body — this is what Gmail's ~102KB clip threshold actually measures. */
export function htmlByteSize(html) {
  if (!html) return 0;
  // TextEncoder is the web-standard way to measure UTF-8 bytes (Node's
  // Buffer isn't available in the Workers runtime).
  return new TextEncoder().encode(html).length;
}
