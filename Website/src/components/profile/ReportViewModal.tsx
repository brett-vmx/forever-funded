import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * reviews.report_body is already a COMPLETE standalone HTML document (the
 * Worker wraps it with wrapReportWithStyles() before storing it — see
 * Webhook/lib/reportTemplate.js and api/inbound.js), identical to what gets
 * emailed. An iframe is the correct way to render it: injecting a full
 * <html>/<head>/<style>/<body> string via dangerouslySetInnerHTML would be
 * invalid nesting and would leak its styles onto the rest of this page.
 */
export function ReportViewModal({
  reviewId,
  subject,
  onClose,
}: {
  reviewId: string
  subject: string | null
  onClose: () => void
}) {
  const [reportHtml, setReportHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('reviews')
      .select('report_body')
      .eq('id', reviewId)
      .maybeSingle()
      .then(({ data }) => {
        setReportHtml(data?.report_body ?? null)
        setLoading(false)
      })
  }, [reviewId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleIframeLoad() {
    const doc = iframeRef.current?.contentWindow?.document
    if (doc && iframeRef.current) {
      iframeRef.current.style.height = `${doc.body.scrollHeight}px`
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={subject || 'Report'}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <p className="truncate font-heading font-semibold text-ink">
            {subject || '(no subject)'}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-4 w-full animate-pulse rounded bg-band-emerald/60" />
              <div className="h-4 w-full animate-pulse rounded bg-band-emerald/60" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-band-emerald/60" />
            </div>
          ) : reportHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={reportHtml}
              onLoad={handleIframeLoad}
              title={subject || 'Report'}
              className="w-full rounded-xl"
              style={{ minHeight: '200px' }}
            />
          ) : (
            <p className="p-6 leading-relaxed text-muted">
              We couldn’t load this report just now. Try again shortly.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
