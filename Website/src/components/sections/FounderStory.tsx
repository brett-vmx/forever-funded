import { Section } from '../ui/Section'

export function FounderStory() {
  return (
    <Section id="founder" tint="emerald">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Why I built this.
          </h2>

          <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
            <p>
              I’ve spent 15 years in full-time ministry, more than a decade of it on the
              field in 10/40 Window countries, including years in one of the most digitally
              restricted, closely watched places on earth.
            </p>
            <p>
              <strong className="font-semibold text-ink">
                I’ve been writing and studying supporter updates for over 20 years and
                here’s what I’ve come to believe:
              </strong>{' '}
              most ongoing support problems aren’t fundraising problems. They’re
              communication problems. Most people don’t support projects. They support{' '}
              <em>people.</em> And it’s your updates that keep them feeling close to you.
            </p>

            <blockquote className="border-l-4 border-primary pl-5 font-heading text-2xl font-semibold leading-snug text-ink sm:text-3xl">
              For many of your supporters,{' '}
              <span className="text-primary">your email updates are the relationship.</span>
            </blockquote>

            <p>
              Your mom and your BFFs will keep up with you through live conversations and
              other means. But for many supporters, your email is the <em>only</em> means.
            </p>

            <p>
              I’ve spent two decades learning what keeps supporters engaged for the long
              haul, and what quietly drives them away. The Email Coach is that experience,
              made available to you right before you hit send. It won’t replace the spouse
              or trusted friend who reads your letters, but it’ll catch what you can’t see
              in your own writing, in less than two minutes.
            </p>
          </div>

          {/* TODO: real founder name + one line of who you are, as much as is safe to share. */}
          <p className="mt-6 font-heading font-semibold text-ink">
            Brett, founder of Forever Funded
          </p>
        </div>

        <div className="order-first lg:order-last">
          <img
            src="/brett-founder-headshot.png"
            alt="Brett, the founder of Forever Funded"
            className="aspect-[3/4] w-full rounded-2xl object-cover shadow-sm"
          />
        </div>
      </div>
    </Section>
  )
}
