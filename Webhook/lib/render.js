// Mobile visual rendering for the Coach (v2 path only).
//
// Renders the email's HTML to a mobile-width image via Cloudflare Browser
// Rendering (the first-party Puppeteer binding — no API token), then slices it
// into vertical tiles each under Anthropic's 1568px long-edge limit so every
// tile stays at full, readable resolution. The tiles are handed to the Coach
// call as a sequence of image blocks (see lib/anthropic.js).
//
// Design guarantees:
// - Never throws to the caller. Any failure returns an empty tile list so the
//   pipeline falls back to text-only — a render problem must never block a
//   report from going out.
// - Gated by RENDER_ALLOWLIST (soft rollout). See shouldRender().

import puppeteer from '@cloudflare/puppeteer';

const VIEWPORT_WIDTH = 390;     // iPhone-class mobile width
const MAX_TILE_HEIGHT = 1500;   // < Anthropic's 1568px long-edge limit → no downscaling
const MAX_TILES = 14;           // ceiling; a longer letter is tiled-what-fits + flagged
const SETCONTENT_TIMEOUT_MS = 20000;

/**
 * Soft-rollout gate. RENDER_ALLOWLIST is a comma-separated list of profile
 * emails; "*" enables rendering for everyone; empty/unset disables it.
 */
export function shouldRender(env, profileEmail) {
  const list = (env.RENDER_ALLOWLIST || '').trim();
  if (!list) return false;
  if (list === '*') return true;
  if (!profileEmail) return false;
  const allow = list.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allow.includes(profileEmail.toLowerCase());
}

/**
 * Renders htmlBody and returns { tiles, truncated }.
 *   tiles: [{ base64, mediaType }]  — top-to-bottom slices, empty on any failure
 *   truncated: true if the email exceeded MAX_TILES (a length signal for the Coach)
 */
export async function renderEmailTiles(env, htmlBody) {
  if (!htmlBody || !env.BROWSER) return { tiles: [], truncated: false };

  let browser;
  try {
    browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport({ width: VIEWPORT_WIDTH, height: 800 });
    // 'load' (not 'networkidle0') so a hanging tracking pixel / keep-alive
    // connection can't stall the render; timeout guards a truly stuck resource.
    await page.setContent(htmlBody, { waitUntil: 'load', timeout: SETCONTENT_TIMEOUT_MS });

    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    const tiles = [];
    let truncated = false;
    for (let y = 0; y < fullHeight; y += MAX_TILE_HEIGHT) {
      if (tiles.length >= MAX_TILES) { truncated = true; break; }
      const height = Math.min(MAX_TILE_HEIGHT, fullHeight - y);
      const buf = await page.screenshot({
        clip: { x: 0, y, width: VIEWPORT_WIDTH, height },
        type: 'jpeg',
        quality: 80,
      });
      tiles.push({ base64: bytesToBase64(buf), mediaType: 'image/jpeg' });
    }
    return { tiles, truncated };
  } catch (err) {
    // Swallow — the pipeline falls back to text-only. Logged so we can see
    // how often rendering fails in practice.
    console.error('renderEmailTiles failed, falling back to text-only:', err);
    return { tiles: [], truncated: false };
  } finally {
    if (browser) {
      try { await browser.close(); } catch { /* ignore close errors */ }
    }
  }
}

// screenshot() returns a Uint8Array/Buffer; encode to base64 in chunks so a
// large image can't blow the argument limit of String.fromCharCode.
function bytesToBase64(bytes) {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
