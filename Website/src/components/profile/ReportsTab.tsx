import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/formatDate'
import { COACH_API_URL } from '../../lib/constants'
import { ReportDialog } from './ReportDialog'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

type ReviewRow = {
  id: string
  subject: string | null
  word_count: number | null
  status: 'received' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
}

export function ReportsTab({ userId }: { userId: string | undefined }) {
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogState, setDialogState] = useState<{
    review: ReviewRow
    segment: 'report' | 'conversation'
  } | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function downloadPdf(review: ReviewRow) {
    if (!supabase || downloadingId) return
    setDownloadingId(review.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      const res = await fetch(`${COACH_API_URL}/api/report-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ review_id: review.id }),
      })
      if (!res.ok) throw new Error(`PDF request failed: ${res.status}`)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `forever-funded-review-${review.created_at.slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download report PDF:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('reviews')
      .select('id, subject, word_count, status, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as ReviewRow[]) ?? [])
        setLoading(false)
      })
  }, [userId])

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <h2 className="font-heading text-xl font-semibold">Reports</h2>

        {loading ? (
          <div className="mt-4 space-y-3">
            <div className="h-14 w-full animate-pulse rounded-lg bg-band-emerald/60" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-band-emerald/60" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-band-emerald/60" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {review.subject || '(no subject)'}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{formatDate(review.created_at)}</p>
                </div>

                {review.status === 'completed' ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDialogState({ review, segment: 'report' })}
                      aria-label="View report"
                      title="View report"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-band-emerald text-primary-dark transition-colors duration-150 hover:bg-primary-dark hover:text-white"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialogState({ review, segment: 'conversation' })}
                      aria-label="Talk to Coach"
                      title="Talk to Coach"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-band-emerald text-primary-dark transition-colors duration-150 hover:bg-primary-dark hover:text-white"
                    >
                      <ChatIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadPdf(review)}
                      disabled={downloadingId === review.id}
                      aria-label="Download PDF"
                      title="Download PDF"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-band-emerald text-primary-dark transition-colors duration-150 hover:bg-primary-dark hover:text-white disabled:pointer-events-none disabled:opacity-50"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                ) : review.status === 'failed' ? (
                  <span className="shrink-0 text-sm text-muted">Not completed</span>
                ) : (
                  <span className="shrink-0 text-sm text-muted">Processing…</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 leading-relaxed text-muted">
            Your reviewed letters will appear here — send your first draft to your review
            address above.
          </p>
        )}
      </div>

      {dialogState && (
        <ReportDialog
          reviewId={dialogState.review.id}
          subject={dialogState.review.subject}
          initialSegment={dialogState.segment}
          onClose={() => setDialogState(null)}
        />
      )}
    </>
  )
}
