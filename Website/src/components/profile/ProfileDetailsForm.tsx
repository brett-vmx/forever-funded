import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'

const COACH_CONTEXT_EXAMPLES = [
  'I have someone in my audience that is colorblind. Please flag any accessibility issues.',
  'My audience is very familiar with the acronyms CPM DMM T4T and 4 Fields, so no need to flag them.',
  'I was saved through campus ministry.',
  'My list has lots of Spanish speakers.',
  'I use general terms like "the region" instead of naming a country on purpose.',
  'The term "majority" refers to the majority people group in my country. My audience knows what I’m talking about.',
  'I end every email with a Bible verse. It’s intentional, not filler.',
  'I tend to undersell how hard things have been. Feel free to gently point that out.',
  'English is my second language. Please help me with spelling and grammar.',
  'I always keep these short since my supporters are busy. Brevity is intentional.',
]

const COACH_CONTEXT_ROTATE_MS = 5000

export type DeclaredFields = {
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  ministry_title: string | null
  organization_name: string | null
  college_campus: string | null
  coach_instructions: string | null
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none'
const labelClass = 'block text-sm font-medium text-ink'

/** Trim, and store empty as null so we don't persist blank strings. */
function clean(v: string): string | null {
  const t = v.trim()
  return t === '' ? null : t
}

type FormState = {
  firstName: string
  lastName: string
  city: string
  country: string
  ministryTitle: string
  organizationName: string
  collegeCampus: string
  coachInstructions: string
}

function toFormState(fields: DeclaredFields): FormState {
  return {
    firstName: fields.first_name ?? '',
    lastName: fields.last_name ?? '',
    city: fields.city ?? '',
    country: fields.country ?? '',
    ministryTitle: fields.ministry_title ?? '',
    organizationName: fields.organization_name ?? '',
    collegeCampus: fields.college_campus ?? '',
    coachInstructions: fields.coach_instructions ?? '',
  }
}

/** Compares cleaned values, so "" and untouched-whitespace don't count as changes. */
function isDirty(current: FormState, baseline: FormState): boolean {
  return (Object.keys(current) as (keyof FormState)[]).some(
    (key) => clean(current[key]) !== clean(baseline[key]),
  )
}

export function ProfileDetailsForm({ initial }: { initial: DeclaredFields }) {
  const [baseline, setBaseline] = useState<FormState>(() => toFormState(initial))
  const [form, setForm] = useState<FormState>(() => toFormState(initial))

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Random start so the same examples aren't always the first thing visible.
  const [placeholderIndex, setPlaceholderIndex] = useState(() =>
    Math.floor(Math.random() * COACH_CONTEXT_EXAMPLES.length),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % COACH_CONTEXT_EXAMPLES.length)
    }, COACH_CONTEXT_ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const dirty = isDirty(form, baseline)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setStatus('error')
      setErrorMsg('We’re not connected right now. Please try again shortly.')
      return
    }
    setStatus('saving')
    setErrorMsg('')
    const { error } = await supabase.rpc('update_own_profile', {
      p_first_name: clean(form.firstName),
      p_last_name: clean(form.lastName),
      p_city: clean(form.city),
      p_country: clean(form.country),
      p_ministry_title: clean(form.ministryTitle),
      p_organization_name: clean(form.organizationName),
      p_college_campus: clean(form.collegeCampus),
      p_coach_instructions: clean(form.coachInstructions),
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('saved')
      setBaseline(form)
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className={labelClass}>
            First name
          </label>
          <input
            id="first_name"
            type="text"
            maxLength={100}
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>
            Last name
          </label>
          <input
            id="last_name"
            type="text"
            maxLength={100}
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            type="text"
            maxLength={100}
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>
            Country
          </label>
          <input
            id="country"
            type="text"
            maxLength={100}
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>
      <p className="-mt-3 text-xs leading-relaxed text-muted">
        You can also be general (e.g. “urban Southeast Asia”), no need for precise details.
      </p>

      <div>
        <label htmlFor="college_campus" className={labelClass}>
          College campus
        </label>
        <input
          id="college_campus"
          type="text"
          maxLength={150}
          value={form.collegeCampus}
          onChange={(e) => update('collegeCampus', e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="organization_name" className={labelClass}>
          Organization
        </label>
        <input
          id="organization_name"
          type="text"
          maxLength={150}
          value={form.organizationName}
          onChange={(e) => update('organizationName', e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="ministry_title" className={labelClass}>
          Ministry
        </label>
        <input
          id="ministry_title"
          type="text"
          maxLength={120}
          value={form.ministryTitle}
          onChange={(e) => update('ministryTitle', e.target.value)}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="coach_instructions" className={labelClass}>
          Additional context for the Coach
        </label>
        <textarea
          id="coach_instructions"
          rows={4}
          maxLength={1000}
          value={form.coachInstructions}
          onChange={(e) => update('coachInstructions', e.target.value)}
          placeholder={COACH_CONTEXT_EXAMPLES[placeholderIndex]}
          className={`mt-1 resize-y ${inputClass}`}
        />
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Anything the Coach should know before reviewing: your audience, your style, an
          ongoing situation.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={status === 'saving'}
          className={
            dirty
              ? ''
              : '!bg-band-emerald !text-primary-dark !shadow-none hover:!bg-band-emerald'
          }
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
        {status === 'saved' && (
          <span className="text-sm font-medium text-primary-dark">Saved ✓</span>
        )}
        {status === 'error' && <span className="text-sm text-brick">{errorMsg}</span>}
      </div>
    </form>
  )
}
