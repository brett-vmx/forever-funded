import { Section } from '../ui/Section'

const STEPS = [
  {
    n: 1,
    title: 'Create your account.',
    body: 'Sign up with your email.',
  },
  {
    n: 2,
    title: 'Send your draft.',
    body: 'Send a test message to your private review email address that we generate with your account.',
  },
  {
    n: 3,
    title: 'Get your report.',
    body: 'A personal, point-by-point review lands in your inbox in about 83 seconds.',
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works" tint="emerald">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          20 years of experience, <span className="text-primary">delivered in 83 seconds.</span>
        </h2>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="relative rounded-2xl border border-border bg-surface p-7 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-white">
              {step.n}
            </span>
            <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
