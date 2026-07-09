import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from './Button'

type Source = 'course' | 'newsletter'

/**
 * Newsletter / "notify me" email capture. Writes to the `email_signups`
 * table (see Webhook/db/migrations/0005_email_signups.sql) — run that
 * migration in Supabase before this can succeed.
 */
export function EmailCapture({
  source,
  cta = 'Notify me',
  placeholder = 'you@ministry.org',
  className = '',
  dark = false,
  inputClassName = '',
}: {
  source: Source
  cta?: string
  placeholder?: string
  className?: string
  dark?: boolean
  inputClassName?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  if (status === 'done') {
    return (
      <p className={`text-sm ${dark ? 'text-white/80' : 'text-primary-dark'} ${className}`}>
        Thanks! We’ll be in touch. ✅
      </p>
    )
  }

  return (
    <form
      className={`flex w-full flex-col gap-2 sm:flex-row ${className}`}
      onSubmit={async (e) => {
        e.preventDefault()
        if (!supabase) {
          setStatus('error')
          return
        }
        setStatus('sending')
        const { error } = await supabase
          .from('email_signups')
          .insert({ email: email.trim(), source })
        // A duplicate signup (same email + source) isn't a real failure —
        // treat it the same as success rather than showing an error.
        setStatus(error && error.code !== '23505' ? 'error' : 'done')
      }}
    >
      <label className="sr-only" htmlFor={`capture-${cta}`}>
        Email address
      </label>
      <input
        id={`capture-${cta}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm focus:outline-none ${
          dark
            ? 'border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/50'
            : 'border-border bg-surface text-ink placeholder:text-muted/70 focus:border-primary'
        } ${inputClassName}`}
      />
      <Button type="submit" size="sm" className="shrink-0" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : cta}
      </Button>
      {status === 'error' && (
        <p className="text-sm text-brick">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
