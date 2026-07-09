import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { LogoMark } from '../ui/LogoMark'

type Mode = 'signup' | 'login'
type Status = 'idle' | 'sending' | 'sent' | 'error'

type AuthModalContextValue = { open: (mode?: Mode) => void }
const AuthModalContext = createContext<AuthModalContextValue | null>(null)

/** Open the shared magic-link modal from anywhere (CTAs, header, etc.). */
export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within <AuthModalProvider>')
  return ctx
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('signup')

  const open = useCallback((m: Mode = 'signup') => {
    setMode(m)
    setIsOpen(true)
  }, [])

  return (
    <AuthModalContext.Provider value={{ open }}>
      {children}
      {isOpen && <Modal mode={mode} onClose={() => setIsOpen(false)} />}
    </AuthModalContext.Provider>
  )
}

function Modal({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the email field on open; close on Escape.
  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setStatus('error')
      setErrorMsg('Sign-in isn’t configured yet. Please try again shortly.')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  const heading =
    mode === 'login' ? (
      'Welcome back'
    ) : (
      <>
        Start your <span className="text-primary">free trial</span>
      </>
    )
  const sub =
    mode === 'login'
      ? 'Enter your email and we’ll send you a magic link to sign in.'
      : 'Enter your email to get 10 free credits to use in 90 days.'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-surface p-7 shadow-xl sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {status === 'sent' ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-band-emerald text-primary-dark">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 6h16v12H4z" />
              </svg>
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-semibold">
              Check your inbox
            </h2>
            <p className="mt-2 text-muted">
              We sent a magic link to <span className="font-medium text-ink">{email}</span>.
              Click it to finish signing in. You can close this window.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2.5">
              <LogoMark className="h-8 w-8 text-primary" />
              <span className="font-heading text-lg font-semibold">Forever Funded</span>
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-semibold">
              {heading}
            </h2>
            <p className="mt-2 text-muted">{sub}</p>

            {!supabaseConfigured && (
              <p className="mt-4 rounded-lg bg-band-brick px-3 py-2 text-sm text-brick">
                Auth isn’t configured in this environment yet.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5">
              <label htmlFor="auth-email" className="sr-only">
                Email address
              </label>
              <input
                ref={inputRef}
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@ministry.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-0 bg-band-emerald px-4 py-3 text-ink placeholder:text-muted/70 focus:outline-none"
              />
              {status === 'error' && (
                <p className="mt-2 text-sm text-brick">{errorMsg}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full"
                disabled={status === 'sending'}
              >
                {status === 'sending'
                  ? 'Sending…'
                  : mode === 'signup'
                    ? 'Start my free trial'
                    : 'Send me a magic link'}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-muted">
              No credit card required.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
