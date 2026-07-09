import type { ReactNode } from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { MailOpen, Archive } from 'lucide-react'
import type { Tint } from '../ui/Section'
import mailchimp from '../../assets/esp/Mailchimp.jpg'
import gmail from '../../assets/esp/gmail.svg'

// Toggle to preview this feature on a dark-green band instead of white.
const WHAT_IT_CHECKS_DARK = true

const ANTHROPIC_LOGO = 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/anthropic.png'

type PipelineStep = {
  name: string
  body: ReactNode
  img: string
  alt: string
  fit: 'cover' | 'contain' // cover for logos with their own bg, contain (on white) otherwise
}

const ANTHROPIC_PRIVACY_URL = 'https://privacy.claude.com/en/collections/10663361-commercial-customers'

type Envelope = { count: string; label: string; tone: 'emerald' | 'brick' }

type ComboPanel = {
  heading: ReactNode
  body: ReactNode
  accent: string
  illo: string // short label for the illustration placeholder
  envelopes?: Envelope[] // Do's/Don'ts envelope cards, rendered below the body
  openedVsArchived?: boolean // green open-envelope + crossed-out red archive icon pair
}

type Feature = {
  id?: string // anchor id on the section (for nav links)
  heading: ReactNode
  body?: ReactNode
  tint: Tint
  accent: string // text color class for the illustration accent
  illo: string // short label for the illustration placeholder
  image?: string // real illustration (public path); falls back to placeholder
  envelopes?: Envelope[] // Do's/Don'ts envelope cards as the illustration
  privacy?: boolean // show the "Read our full Privacy Policy" link
  pipeline?: PipelineStep[] // renders the dedicated secure-pipeline layout
  combo?: ComboPanel[] // two self-contained panels side by side, each stacked heading/body/visual
}

const SECURITY_PIPELINE: PipelineStep[] = [
  {
    name: 'Your ESP',
    body: 'Send a test from Mailchimp or whatever email service provider you use.',
    img: mailchimp,
    alt: 'Mailchimp',
    fit: 'cover',
  },
  {
    name: 'Anthropic',
    body: (
      <>
        The Coach runs on{' '}
        <a
          href={ANTHROPIC_PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-dark hover:underline"
        >
          Anthropic’s API
        </a>{' '}
        and its enterprise-grade data protections.
      </>
    ),
    img: ANTHROPIC_LOGO,
    alt: 'Anthropic',
    fit: 'contain',
  },
  {
    name: 'Your Email',
    body: 'Receive a report in Gmail or wherever you normally receive email.',
    img: gmail,
    alt: 'Gmail',
    fit: 'contain',
  },
]

const FEATURES: Feature[] = [
  {
    id: 'what-it-checks',
    heading: <></>,
    tint: WHAT_IT_CHECKS_DARK ? 'forest' : 'white',
    accent: 'text-primary',
    illo: '',
    combo: [
      {
        heading: (
          <>
            Not just a <span className="text-primary">spell-checker.</span>
          </>
        ),
        body: (
          <>
            Our Coach doesn’t just look for embarrassing typos and grammatical errors. It
            looks for <span className="font-semibold text-primary">22 best practices</span> that
            keep supporters opening your emails, reading them, praying for you, and
            supporting you for the long haul and{' '}
            <span className="font-semibold text-brick">26 quiet mistakes</span> that cause
            supporters to tune out over time.
          </>
        ),
        accent: 'text-primary',
        illo: 'Mentor + check illustration',
        envelopes: [
          { count: '22', label: 'Do’s', tone: 'emerald' },
          { count: '26', label: 'Don’ts', tone: 'brick' },
        ],
      },
      {
        heading: (
          <>
            Excited <span className="text-primary">opens.</span> Not{' '}
            <span className="text-brick">archives.</span>
          </>
        ),
        body: (
          <>
            Your subject line, your preview text, your lead story, your formatting, your
            prayer requests, and your ask all impact whether your email gets{' '}
            <span className="font-semibold text-primary">excitedly opened</span>, read,
            prayed for, and supported...
            <br />
            <br />
            ...or <span className="font-semibold text-brick">quietly archived</span>.
          </>
        ),
        accent: 'text-brick',
        illo: 'Opened vs archived illustration',
        openedVsArchived: true,
      },
    ],
  },
  {
    heading: (
      <>
        A fully <span className="text-primary">secure pipeline.</span>
      </>
    ),
    body: 'Your draft moves through an encrypted path from the moment you hit send to the moment your report lands in your inbox.',
    tint: 'emerald',
    accent: 'text-primary',
    illo: 'Encrypted pipeline illustration',
    image: '/security-shield.png',
    privacy: true,
    pipeline: SECURITY_PIPELINE,
  },
]

const tintBg: Record<Tint, string> = {
  white: 'bg-surface',
  emerald: 'bg-band-emerald',
  tan: 'bg-band-tan',
  brick: 'bg-band-brick',
  camel: 'bg-camel/25',
  forest: 'bg-primary-dark text-white',
}

/** "Opened" (green envelope) vs "archived" (red box) icon pair — lucide-react glyphs. */
function OpenedVsArchived() {
  return (
    <div className="flex h-[126px] items-center justify-center gap-6" aria-hidden="true">
      <div className="relative flex h-[126px] w-[126px] items-center justify-center rounded-2xl border-2 border-primary/40 bg-white">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-xl leading-none">
          ✅
        </span>
        <MailOpen className="h-9 w-9 text-primary" strokeWidth={1.5} />
      </div>
      <div className="relative flex h-[126px] w-[126px] items-center justify-center rounded-2xl border-2 border-brick/40 bg-white">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-xl leading-none">
          ❌
        </span>
        <Archive className="h-9 w-9 text-brick" strokeWidth={1.5} />
      </div>
    </div>
  )
}

/** Do's/Don'ts "envelope": a tinted flap over a card with the count + label. */
function EnvelopeCard({ count, label, tone }: Envelope) {
  const border = tone === 'emerald' ? 'border-primary/40' : 'border-brick/40'
  const flapBg = tone === 'emerald' ? 'bg-primary/10' : 'bg-brick/10'
  const accent = tone === 'emerald' ? 'text-primary' : 'text-brick'
  return (
    <div className={`overflow-hidden rounded-xl border-2 ${border} bg-surface shadow-sm`}>
      <div
        aria-hidden="true"
        className={`h-11 ${flapBg}`}
        style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
      />
      <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-1">
        <span className={`font-heading text-3xl font-bold leading-none ${accent}`}>{count}</span>
        <span className="font-heading text-sm font-semibold text-ink">{label}</span>
      </div>
    </div>
  )
}

/** Down arrow on mobile, right arrow on desktop — connects pipeline steps. */
function FlowArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center text-primary" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-7 w-7 sm:hidden" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
      </svg>
      <svg viewBox="0 0 24 24" className="hidden h-7 w-7 sm:block" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

function ComboFeature({ panels }: { panels: ComboPanel[] }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {panels.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border bg-gray-100 p-6 sm:p-8">
            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{p.heading}</h3>
            <p className="mt-4 text-lg leading-relaxed text-muted">{p.body}</p>

            {p.envelopes ? (
              <div className="mt-6 flex justify-center gap-4 sm:gap-6">
                {p.envelopes.map((e) => (
                  <div key={e.label} className="w-[140px] max-w-[45%] sm:w-[190px]">
                    <EnvelopeCard {...e} />
                  </div>
                ))}
              </div>
            ) : p.openedVsArchived ? (
              <div className="mt-6">
                <OpenedVsArchived />
              </div>
            ) : (
              // Illustration placeholder — swap for real art before public.
              <div
                className="mt-6 flex h-[126px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60"
                aria-hidden="true"
              >
                <span className={`text-sm font-medium ${p.accent}`}>[ {p.illo} ]</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelineFeature({ f }: { f: Feature }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{f.heading}</h3>
        {f.body && <p className="mt-4 text-lg leading-relaxed text-muted">{f.body}</p>}
        {f.image && (
          <img
            src={f.image}
            alt=""
            aria-hidden="true"
            className="mx-auto mt-5 h-20 w-auto object-contain"
          />
        )}
      </div>

      <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {f.pipeline!.map((step, i) => (
          <Fragment key={step.name}>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center sm:w-52">
              <div className="mx-auto mb-3 h-14 w-14 overflow-hidden rounded-2xl border border-border bg-white">
                <img
                  src={step.img}
                  alt={step.alt}
                  className={`h-full w-full ${step.fit === 'cover' ? 'object-cover' : 'object-contain p-2'}`}
                />
              </div>
              <h4 className="font-heading font-semibold">{step.name}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
            {i < f.pipeline!.length - 1 && <FlowArrow />}
          </Fragment>
        ))}
      </div>

      {f.privacy && (
        <div className="mt-8 text-center">
          <Link
            to="/privacy"
            className="inline-block font-heading font-semibold text-primary-dark hover:underline"
          >
            Read our full Privacy Policy →
          </Link>
        </div>
      )}
    </div>
  )
}

export function Features() {
  return (
    <div id="features">
      {FEATURES.map((f, i) => (
        <section key={i} id={f.id} className={tintBg[f.tint]}>
          {f.combo ? (
            <ComboFeature panels={f.combo} />
          ) : f.pipeline ? (
            <PipelineFeature f={f} />
          ) : (
            <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
              <div
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                  i % 2 === 1 ? 'lg:[&>*:first-child]:order-last' : ''
                }`}
              >
                <div>
                  <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{f.heading}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{f.body}</p>
                </div>

                {f.envelopes ? (
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {f.envelopes.map((e) => (
                      <EnvelopeCard key={e.label} {...e} />
                    ))}
                  </div>
                ) : (
                  // Illustration placeholder — swap for real art before public.
                  <div
                    className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60"
                    aria-hidden="true"
                  >
                    <span className={`text-sm font-medium ${f.accent}`}>[ {f.illo} ]</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
