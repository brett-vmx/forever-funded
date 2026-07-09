import type { ReactNode } from 'react'
import { Section } from '../ui/Section'

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'I’ve been writing support letters for years. Is this really for me?',
    a: 'It’s especially for you. This isn’t a beginner’s course. It’s a second set of eyes for everyone. Even after 20 years of writing updates, I was blown away by what my first report caught! I have full confidence that you will find it valuable. And with our free trial, it doesn’t hurt to try!',
  },
  {
    q: 'Will it change my voice or make my letters sound generic?',
    a: 'No, the Coach will make suggestions, but you’re always in full control of what you end up writing and sending.',
  },
  {
    q: 'Does the Coach use AI? Can AI really coach me?',
    a: 'Yes and yes. The Coach uses AI to give you feedback instantly and privately. But the judgment behind it isn’t generic AI. Think of it as feedback from a second pair of eyes with 20 years of experience that is always available, not a full replacement for a trusted spouse or friend’s eyes.',
  },
  {
    q: 'Is the Coach private and secure?',
    a: (
      <>
        Yes. Your drafts and reports move through a completely encrypted pipeline
        governed by the{' '}
        <a
          href="https://privacy.claude.com/en/collections/10663361-commercial-customers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-dark underline hover:no-underline"
        >
          Anthropic API Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://www.cloudflare.com/privacypolicy/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-dark underline hover:no-underline"
        >
          Cloudflare Privacy Policy
        </a>
        . Also refer to the privacy policies of your sending email service provider
        (e.g. Mailchimp) and your receiving email service provider (e.g. Gmail).
      </>
    ),
  },
  {
    q: 'What email service providers does the Coach work with?',
    a: 'Works with any tool that lets you send a test email: Mailchimp, Kit, Constant Contact, Gmail, Outlook, and more.',
  },
  {
    q: 'Does it work with Stello?',
    a: 'Not currently. Stello sends an encrypted link rather than a normal email, so there’s no draft for the Coach to review. If you use Stello, you can still get a review by pasting your draft into a regular email (Gmail, Outlook) and sending that to your review address instead.',
  },
  {
    q: 'What if my email service provider doesn’t have a "Send a test email" feature?',
    a: 'Send the email to yourself and only yourself. Then forward that email to your personal review email address.',
  },
  {
    q: 'How fast is the report?',
    a: 'On average, people receive their reports in 83 seconds.',
  },
  {
    q: 'How does the free trial work?',
    a: 'You get 3 free credits to use within 30 days to try out the Coach. (Our launch bonus is 10 free credits to use within 90 days). No credit card is required to start. The Coach is the same for the trial and paid plans.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel anytime. No contracts, no questions asked. Your unlimited credits will be available for the duration of your payment period (monthly or annual).',
  },
]

export function FAQ() {
  return (
    <Section id="faq" tint="forest">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          <span className="text-[#a7f3d0]">Your questions, </span>
          <span className="text-white">answered.</span>
        </h2>

        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-surface">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-heading text-lg font-semibold text-ink">
                {item.q}
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="pb-5 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
