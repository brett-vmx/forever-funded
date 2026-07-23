// POST /api/report-pdf — renders a single past report to PDF on demand.
// Called from the Website's /profile Reports tab (see Part C of
// profile-reports-phase-build-spec.md). No caching/storage: low volume makes
// on-demand generation cheap enough for now.
//
// Authorization is RLS, not custom logic: the Supabase client is built with
// the CALLER's own access token (getUserClient), so `reviews_select_own`
// (auth.uid() = user_id) means a review_id belonging to someone else simply
// returns no row — indistinguishable from a nonexistent id. Never trust any
// client-sent HTML; the report body is always fetched server-side by id.

import puppeteer from '@cloudflare/puppeteer';
import { getUserClient } from '../lib/supabase.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// The marketing site, for the referral footer link — distinct from
// REVIEW_DOMAIN (review.foreverfunded.org), which is only the inbound
// review-address domain and has no bearing on this outbound link.
const MARKETING_URL = 'https://foreverfunded.org';

export async function handleReportPdf(request, env) {
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

    let reviewId;
    try {
      ({ review_id: reviewId } = await request.json());
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
    }
    if (!reviewId) {
      return Response.json({ error: 'review_id required' }, { status: 400, headers: CORS_HEADERS });
    }

    const supabase = getUserClient(env, accessToken);
    const { data: review, error } = await supabase
      .from('reviews')
      .select('report_body, created_at')
      .eq('id', reviewId)
      .maybeSingle();

    if (error) {
      console.error('report-pdf: review lookup failed:', error);
      return Response.json({ error: 'Lookup failed' }, { status: 500, headers: CORS_HEADERS });
    }
    // No row = either it doesn't exist, or RLS just hid someone else's row —
    // same response either way, which is the point.
    if (!review || !review.report_body) {
      return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
    }

    const fullHtml = addReferralFooter(review.report_body);
    const pdfBuffer = await renderPdf(env, fullHtml);

    const dateStr = new Date(review.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="forever-funded-review-${dateStr}.pdf"`,
      },
    });
  } catch (err) {
    console.error('report-pdf error:', err);
    return Response.json(
      { error: 'Internal error generating PDF' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

/** Same Browser Rendering launch pattern as lib/render.js — close in `finally` so a render error can't leak a session (Browser Rendering has session limits). */
async function renderPdf(env, html) {
  let browser;
  try {
    browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
      printBackground: true,
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore close errors */
      }
    }
  }
}

/**
 * reviews.report_body is already a COMPLETE HTML document — wrapReportWithStyles
 * was applied at generation time (see lib/reportTemplate.js and
 * api/inbound.js). Insert the referral line before </body> rather than
 * re-wrapping, which would nest a second <html>/<head> inside the existing one.
 */
function addReferralFooter(reportHtml) {
  const footer = `
    <p style="margin-top:32px; padding-top:16px; border-top:1px solid #e0e0e0; font-size:13px; color:#888888; text-align:center;">
      Reviewed with the <a href="${MARKETING_URL}" style="color:#059669; text-decoration:none;">Forever Funded Email Coach</a>
    </p>`;
  return reportHtml.includes('</body>')
    ? reportHtml.replace('</body>', `${footer}</body>`)
    : reportHtml + footer; // defensive fallback if the stored shape ever changes
}
