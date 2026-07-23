/**
 * Placeholder external links, referenced once here so they're easy to swap.
 */
export const SAMPLE_REPORT_PDF = '/6-Salvations-through-Storying-Report.pdf'
export const DEMO_LOOM_URL = 'https://www.loom.com/embed/adcc954bac6e486d9dc08d571a1bb60f'

// Must match Webhook/wrangler.toml's REVIEW_DOMAIN.
export const REVIEW_DOMAIN = 'review.foreverfunded.org'

// The deployed Cloudflare Worker's base URL (Webhook/wrangler.toml's `name`).
// No custom route/domain is configured for it yet, so this is the workers.dev
// URL Cloudflare assigns — update this if a custom domain is ever added.
export const COACH_API_URL = 'https://forever-funded-email-coach.brett-66b.workers.dev'
