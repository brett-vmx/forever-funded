import { SimplePage } from './SimplePage'

export function Terms() {
  return (
    <SimplePage title="Terms of Service">
      <p className="text-sm text-muted">
        <strong className="font-semibold text-ink">Effective date:</strong> July 9, 2026
      </p>

      <p>
        These terms govern your use of Forever Funded (“the service”), operated by VMX
        Media. By using the service, you agree to them.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">The service</h2>
      <p>
        Forever Funded provides an AI-assisted “Email Coach” that reviews supporter
        update emails and returns feedback, along with related content. The Coach offers
        suggestions to help you communicate better; it is a tool, not a substitute for
        your own judgment or a trusted human reviewer.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Your account</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>You must provide an accurate email address and be at least 16 years old.</li>
        <li>
          You’re responsible for activity under your account and for keeping access to
          your email secure (since sign-in uses email links).
        </li>
        <li>One account per person unless we agree otherwise.</li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Acceptable use</h2>
      <p>You agree not to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Use the service for unlawful purposes or to submit content you don’t have the
          right to submit.
        </li>
        <li>
          Attempt to break, overload, reverse-engineer, or gain unauthorized access to the
          service.
        </li>
        <li>Abuse the review system (for example, attempting to evade usage limits).</li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Plans, credits, and payment
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          We offer a free trial with a limited number of review credits, and paid plans
          with expanded access. Current details are on our pricing page.
        </li>
        <li>
          Paid plans, when available, are billed through our payment processor. Fees,
          billing cycles, and any refund terms will be presented at checkout.
        </li>
        <li>
          We may change plans and pricing going forward; changes won’t affect a billing
          period you’ve already paid for.
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Your content</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>You keep ownership of the drafts you submit.</li>
        <li>
          You grant us permission to process, store, and display your content{' '}
          <strong className="font-semibold text-ink">to you</strong> as needed to provide
          the service, and to review it to improve the Coach, as described in our Privacy
          Policy.
        </li>
        <li>
          We do not claim ownership of your letters and do not sell them or use them to
          train outside AI models.
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        AI-generated feedback — important
      </h2>
      <p>
        The Coach’s feedback is generated with AI and provided “as is.” It may be
        incomplete or occasionally wrong. You are responsible for what you ultimately
        send to your supporters. Forever Funded is not responsible for outcomes resulting
        from following (or not following) the Coach’s suggestions.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Availability</h2>
      <p>
        We aim to keep the service running but don’t guarantee uninterrupted
        availability, and we may modify or discontinue features.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Termination</h2>
      <p>
        You may stop using the service anytime. We may suspend or terminate accounts that
        violate these terms or abuse the service.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Disclaimers and limitation of liability
      </h2>
      <p>
        The service is provided “as is,” without warranties of any kind. To the fullest
        extent permitted by law, VMX Media will not be liable for indirect or
        consequential damages, and our total liability is limited to the amount you paid
        us in the 12 months before the claim.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Governing law</h2>
      <p>
        These terms are governed by the laws of the United States, without regard to
        conflict-of-law rules.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Changes</h2>
      <p>We may update these terms; continued use after changes means you accept them.</p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Contact</h2>
      <p>Questions? Email hello (at) foreverfunded.org.</p>
    </SimplePage>
  )
}
