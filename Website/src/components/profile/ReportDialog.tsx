import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { COACH_API_URL } from '../../lib/constants'

type Segment = 'report' | 'conversation'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  )
}

/**
 * One shared dialog per report, with two segments switchable by a tap — no
 * separate "view report" vs "chat" pages, no scrolling required to reach
 * either (see part-d-chat-addendum.md). Both segments stay mounted (toggled
 * via CSS, not conditional rendering) so each keeps its own scroll position
 * independently when you flip back and forth.
 */
export function ReportDialog({
  reviewId,
  subject,
  initialSegment = 'report',
  onClose,
}: {
  reviewId: string
  subject: string | null
  initialSegment?: Segment
  onClose: () => void
}) {
  const [segment, setSegment] = useState<Segment>(initialSegment)

  // --- Report segment ---
  // reviews.report_body is already a COMPLETE standalone HTML document (the
  // Worker wraps it with wrapReportWithStyles() before storing it), identical
  // to what gets emailed. An iframe is the correct way to render it: injecting
  // a full <html>/<head>/<style>/<body> string via dangerouslySetInnerHTML
  // would be invalid nesting and would leak its styles onto the rest of this
  // page.
  const [reportHtml, setReportHtml] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // --- Conversation segment ---
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!supabase) {
      setReportLoading(false)
      return
    }
    setReportLoading(true)
    supabase
      .from('reviews')
      .select('report_body')
      .eq('id', reviewId)
      .maybeSingle()
      .then(({ data }) => {
        setReportHtml(data?.report_body ?? null)
        setReportLoading(false)
      })
  }, [reviewId])

  useEffect(() => {
    if (!supabase) {
      setMessagesLoading(false)
      return
    }
    setMessagesLoading(true)
    supabase
      .from('review_messages')
      .select('role, content')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data as ChatMessage[]) ?? [])
        setMessagesLoading(false)
      })
  }, [reviewId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (segment === 'conversation') {
      messagesEndRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [segment, messages, sending])

  function resizeIframe() {
    const doc = iframeRef.current?.contentWindow?.document
    if (doc && iframeRef.current) {
      iframeRef.current.style.height = `${doc.body.scrollHeight}px`
    }
  }

  // The iframe's onLoad fires once, whenever reportHtml first arrives — if
  // that happens while this is the hidden segment (e.g. the dialog opened on
  // Conversation), scrollHeight reads wrong because a display:none element
  // isn't laid out. Re-measure every time Report becomes the active segment,
  // when it's actually visible to measure correctly.
  useEffect(() => {
    if (segment === 'report') resizeIframe()
  }, [segment, reportHtml])

  // Grows the textarea to fit multi-line input, capped by the max-h-32 class
  // below (128px) — resetting to 'auto' first lets it shrink back down too,
  // e.g. after a long draft is sent and the box should collapse to one line.
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 128)}px`
    }
  }, [draft])

  async function sendMessage() {
    const text = draft.trim()
    if (!text || !supabase || sending) return

    setSending(true)
    setChatError(null)
    setDraft('')
    setMessages((prev) => [...(prev ?? []), { role: 'user', content: text }])

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) throw new Error('Not signed in')

      const res = await fetch(`${COACH_API_URL}/api/report-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ review_id: reviewId, message: text }),
      })
      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)

      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [...(prev ?? []), { role: 'assistant', content: data.reply ?? '' }])
    } catch (err) {
      console.error('Failed to send chat message:', err)
      setChatError("That didn't go through. Try sending it again.")
      setMessages((prev) => (prev ?? []).slice(0, -1))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <div className="inline-flex rounded-full bg-band-emerald p-1">
            <button
              type="button"
              onClick={() => setSegment('report')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                segment === 'report' ? 'bg-surface text-ink shadow-sm' : 'text-primary-dark'
              }`}
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => setSegment('conversation')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                segment === 'conversation' ? 'bg-surface text-ink shadow-sm' : 'text-primary-dark'
              }`}
            >
              Talk to Coach
            </button>
          </div>
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

        <div className={segment === 'report' ? 'block p-2' : 'hidden'}>
          {reportLoading ? (
            <div className="space-y-3 p-6">
              <div className="h-4 w-full animate-pulse rounded bg-band-emerald/60" />
              <div className="h-4 w-full animate-pulse rounded bg-band-emerald/60" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-band-emerald/60" />
            </div>
          ) : reportHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={reportHtml}
              onLoad={resizeIframe}
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

        <div className={segment === 'conversation' ? 'flex flex-col' : 'hidden'}>
          <p className="px-6 pt-4 font-heading font-semibold text-ink">
            Talk to Coach about this report
          </p>

          <div className="max-h-[50vh] space-y-3 overflow-y-auto px-6 py-4">
            {messagesLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-band-emerald/60" />
                <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-band-emerald/60" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-primary-dark text-white' : 'bg-band-emerald text-ink'
                    }`}
                  >
                    {m.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Ask why something was flagged, push back on a suggestion, or ask for help with a
                rewrite — Coach will keep talking with you about this specific report.
              </p>
            )}
            {sending && (
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-2xl bg-band-emerald px-4 py-2 text-sm text-muted">
                  Thinking…
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {chatError && <p className="px-6 pb-2 text-sm text-brick">{chatError}</p>}

          <div className="flex items-end gap-2 border-t border-border px-4 py-3">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask Coach a question…"
              className="max-h-32 flex-1 resize-none overflow-y-auto rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || sending}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-dark text-white transition hover:bg-primary disabled:pointer-events-none disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
