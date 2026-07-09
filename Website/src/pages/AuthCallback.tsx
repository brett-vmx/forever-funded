import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogoMark } from '../components/ui/LogoMark'

/**
 * Magic-link landing route. supabase-js (detectSessionInUrl) exchanges the link
 * for a session automatically; we wait for that to resolve, then send the user
 * to /profile. On failure we bounce home.
 */
export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    // If detectSessionInUrl already ran, getSession resolves with the session.
    // Otherwise, onAuthStateChange fires SIGNED_IN once the exchange completes.
    const finish = (ok: boolean) => {
      if (cancelled) return
      navigate(ok ? '/profile' : '/', { replace: true })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish(true)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError(error.message)
        setTimeout(() => finish(false), 2500)
      } else if (data.session) {
        finish(true)
      }
      // else: wait for onAuthStateChange (or the fallback timeout below)
    })

    // Fallback: if nothing resolves, don't hang forever.
    const timeout = setTimeout(() => {
      if (!cancelled) finish(false)
    }, 8000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="h-12 w-12 animate-pulse text-primary" />
      <p className="text-lg font-medium text-ink">
        {error ? 'Something went wrong signing you in.' : 'Signing you in…'}
      </p>
      {error && <p className="max-w-sm text-sm text-muted">{error} Sending you home.</p>}
    </div>
  )
}
