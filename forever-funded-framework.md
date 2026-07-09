# The Forever Funded Framework

*Single source of truth for the course and the Email Coach.*

Every evaluation criterion in Forever Funded lives here, written once. The course
self-checks and the Email Coach's system prompt are both **generated from this
document** — they are never maintained separately. When you add or change a
criterion while writing a lesson, you change it here, and both products inherit
it. This is the literal form of "the moat is the framework, not the AI."

The Coach is **pre-send only**: it reviews a draft *before* it goes to supporters,
and it remembers the writer across submissions via a stored profile. Both facts
shape what it can and can't evaluate, below.

---

## How this document compiles to two products

- **Course self-checks** — For any lesson, collect the `Self-check` line from
  each of its criteria. That list is the lesson's end-of-video rubric, and it's
  what you mean when you tell students "the Coach will check this for you."
- **Coach system prompt** — Collect the `Coach instruction` line from every
  criterion marked **Checkable: Yes** (and the Partials you choose to include),
  grouped by Coach category. That assembled list is the evaluation section of the
  system prompt in the Email Coach framework doc.

So: write the criterion once → it flows to the lesson rubric *and* the Coach.

---

## What the Coach sees on each evaluation

The Coach reviews a draft before it's sent. On each submission it has three
inputs:

1. **The draft** — subject line plus body as text, and the HTML when available
   (HTML is cheaper for judging structure: columns, paragraph length, links).
2. **An optional rendered image** of the email — lets the Coach judge how it
   actually *looks* on a phone (white space, single-column flow, whether the
   photos are any good). Cheap to add; see the vision note under Data model.
3. **The subscriber profile** — a compact, evolving record of this person
   (context they've shared, plus what the Coach has learned across past
   submissions). This is what makes feedback longitudinal instead of one-shot.

Because review happens pre-send, "history" here means *drafts this person
submitted to the Coach*, not letters they actually mailed. That distinction is
why send-frequency stays out of scope (see FREQ-1).

---

## Data model (subscriber profile)

Keep two layers. Both are optional to the user, and both are fed into every
evaluation:

- **Declared** (user-provided, optional): region, sending organization, ministry
  focus, family details — anything they choose to share so the Coach can
  personalize. More context produces more personal coaching. Given this
  audience, encourage non-identifying phrasing ("urban Southeast Asia, church
  planting") over precise identifiers, and make it genuinely optional.
- **Derived** (Coach-maintained): recurring strengths, recurring growth areas,
  the writer's voice, and open story/prayer threads awaiting follow-up.

Each evaluation **reads** the profile plus the new draft (plus the optional
image) and **writes** two things: the coaching report returned to the user, and
an updated derived profile (patterns refreshed, threads opened or closed).
Storing the raw drafts and reports too is cheap and fine, but the derived profile
is what keeps token cost low while making the Coach feel like it remembers them —
feed the small profile, not the whole archive, into each call.

**Vision note:** pass a rendered image as a base64 image block alongside the
text. A typical email screenshot is ~1–2k tokens — well under a cent on top of
the text — so reserve it for the visual-judgment criteria (IMG-*, FMT-3) and
rely on HTML for pure structure.

---

## Criterion schema — stable slug IDs

Each criterion uses the same fields so it can compile cleanly:

- **ID** — a **stable topic slug** (e.g. `STORY-1`, `FMT-2`, `SUBJ-3`), *not* tied
  to lesson number. Lessons can be reordered or renamed freely — as this document
  just proved — without breaking a single cross-reference, the Coach prompt, or
  any code that points at an ID. The prefix self-documents the category:

  | Prefix | Category |
  |---|---|
  | `STAKES` | The Stakes (mindset) |
  | `STORY` | Storytelling |
  | `SUBJ` | Subject line & preview text |
  | `TEXT` | Text & word choice (incl. spelling/grammar) |
  | `IMG` | Images & graphics |
  | `FMT` | Formatting (incl. length & deliverability) |
  | `PRAYER` | Prayer mobilization |
  | `FAM` | Family / the person |
  | `GIVE` | Fundraising / the ask |
  | `REVIEW` | Reviewing (the human pass) |
  | `FREQ` | Frequency |
  | `GROW` | Growing the list |
  | `BONUS` | Bonus material |

- **Coach category** — one of the nine, or `—` if not Coach-evaluated
- **Checkable** — can the Coach assess this given what it sees: the **draft
  text**, an optional **rendered image**, and the **stored profile**?
  - **Yes** — visible in the draft, the image, or reliably tracked in the profile
  - **Partial** — partly visible, or somewhat subjective (say why)
  - **No** — needs something none of those provide: real send history, an offline
    process, or outside context (say why)
- **Principle** — the one-line "why"
- **Good** — what a strong version looks like
- **Flag** — what the Coach (or student) should catch
- **Self-check** — student-facing question, plain and second-person
- **Coach instruction** — how the AI evaluates it

> The Checkable flag still gates your scripting — only promise "the Coach checks
> this" for Yes/Partial criteria. One thing storage does *not* fix: because the
> Coach is pre-send, it sees *drafts you submit*, not letters you actually send,
> so it still can't reliably judge sending frequency (FREQ-1).

---

## Course outline (five parts, current order)

| # | Lesson | Part |
|---|---|---|
| 1 | The Stakes | Part 1 — The Mindset |
| 2 | You're a Storyteller | Part 2 — The Email |
| 3 | Subject Line & Preview Text | Part 2 — The Email |
| 4 | Text & Word Choice | Part 2 — The Email |
| 5 | Images & Graphics | Part 2 — The Email |
| 6 | Formatting | Part 2 — The Email |
| 7 | Mobilizing Prayer | Part 2 — The Email |
| 8 | Family Updates | Part 2 — The Email |
| 9 | Review | Part 3 — The Habits |
| 10 | Frequency | Part 3 — The Habits |
| 11 | The Relational Fundraising Mindset | Part 4 — The Ask |
| 12 | Year-End Giving | Part 4 — The Ask |
| 13 | One-Time & Special Needs | Part 4 — The Ask |
| 14 | Increasing Monthly Support | Part 4 — The Ask |
| 15 | Grow Your Email List | Part 5 — The Future |
| — | Messaging vs Email | Bonus Material |
| — | Choosing an Email Provider | Bonus Material |

Because criterion IDs are stable slugs, this table is the *only* place lesson
order lives — reorder lessons here anytime without touching a single criterion
below.

---

## Coach-checkability map (at a glance)

Use this when deciding how to phrase Coach references in each lesson.

| Lesson | Primary Coach category | Checkable |
|---|---|---|
| 1. The Stakes | Supporter psychology | Partial (tone only) |
| 2. You're a Storyteller | Storytelling | **Yes** |
| 3. Subject Line & Preview Text | Subject line | **Yes** |
| 4. Text & Word Choice | Text & Word Choice | **Yes** |
| 5. Images & Graphics | Readability/formatting | **Yes** (with a rendered image) |
| 6. Formatting | Readability/formatting | **Yes** |
| 7. Mobilizing Prayer | Prayer mobilization | **Yes** |
| 8. Family Updates | Family / the person | Partial (presence yes, boundaries subjective) |
| 9. Review | — | No (read-aloud + a human test-send; not Coach-checkable) |
| 10. Frequency | — | No (sees submitted drafts, not actual sends) |
| 11. The Relational Fundraising Mindset | Fundraising / the ask | No (philosophy; no send history) |
| 12. Year-End Giving | Fundraising / the ask | Partial (this draft's ask yes, real send frequency no) |
| 13. One-Time & Special Needs | Fundraising / the ask | Partial |
| 14. Increasing Monthly Support | Fundraising / the ask | Partial |
| 15. Grow Your Email List | — | No (not visible in a single draft) |
| Bonus: Messaging vs Email | — | No |
| Bonus: Choosing an Email Provider | — | No |

**Storage upgrade:** criteria that track patterns *across* letters — follow-up
(`STORY-7`, `PRAYER-2`) and recurring strengths/weaknesses — move from Partial to
Yes once the subscriber profile exists, because the Coach can compare this draft
against stored history. **Vision upgrade:** the image and layout criteria
(`IMG-*`, `FMT-3`) move to Yes when a rendered image is supplied.

The nine Coach categories: Storytelling · Readability/formatting · Text & Word
Choice · Subject line · Supporter psychology · Prayer mobilization ·
Fundraising/the ask · Family / the person behind the ministry · Typos & grammar.

---

# Part 1 — The Mindset

# Lesson 1 — The Stakes

*Mindset and vision lesson, and the foundation for everything else: for many
supporters the email is the whole relationship; people are watching and engagement
is a spectrum; so steward it like the marketing department — an invitation into
ministry, not selling yourself. Mostly not Coach-checkable; the Coach can only
sense its fruit in tone (warm and inviting vs. transactional and report-like).*

### STAKES-1 Inviting, Not Transactional
- **Coach category:** Supporter psychology
- **Checkable:** Partial
- **Principle:** The fruit of this mindset shows up as warmth and invitation
  rather than a report delivered at arm's length.
- **Self-check:** Does this read like an invitation into my life and ministry, or
  a report delivered at arm's length? *(overlaps the Supporter psychology
  criteria generally — see Working Notes.)*

---

# Part 2 — The Email

# Lesson 2 — You're a Storyteller

### STORY-1 One Story, One Letter
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** A reader can hold one story, not ten updates.
- **Good:** A single scene carries the letter; other items support or are cut.
- **Flag:** Multiple stories competing for the lead; a month-in-review list.
- **Self-check:** Is there *one* story, or several fighting to be the lead?
- **Coach instruction:** Identify whether the email centers on a single story. If
  several compete, name them and recommend which to lead with and which to hold
  for a future letter — and if several strong stories are fighting in one long
  letter, say plainly that a few shorter, more frequent emails may serve better
  than one that tries to carry them all. (This is a content observation about
  *this* letter, not a judgment about sending frequency, which is out of scope.)

### STORY-2 Start in the Scene
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** The lead is where readers stop; don't bury it under runway.
- **Good:** Opens inside the moment — a place, a person, a day.
- **Flag:** Opens with "we hope this finds you well" / "it's been a busy season"
  before any content.
- **Self-check:** Did I bury the lead under a greeting or warm-up?
- **Coach instruction:** Assess the opening. If it's throat-clearing, quote it and
  show where the real story actually starts as a stronger opening line.

### STORY-3 Show the Change
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** A story is a before and an after; without change it's an
  announcement.
- **Good:** Something or someone is clearly different by the end.
- **Flag:** Events listed with no shift, stakes, or resolution.
- **Self-check:** What changed between the start and end of my story?
- **Coach instruction:** Determine whether the story contains a clear change. If
  not, point to where stakes or a turning point could be drawn out.

### STORY-4 Let Someone Else Talk
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** One real quote is worth a paragraph of summary.
- **Good:** At least one line of genuine dialogue, in the person's own words.
- **Flag:** Everything filtered through the writer's summary; no voices.
- **Self-check:** Is there a real quote from someone in the story?
- **Coach instruction:** Check for direct quotation. If absent, note where a quote
  would add life and invite the writer to recall what was actually said.

### STORY-5 Earn Trust with the Telling Detail
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** Concrete detail makes a reader believe and remember — but in an
  email the skill is choosing the *one* telling detail that implies the rest, not
  describing everything. A novel accumulates detail; an email concentrates it.
- **Good:** A specific noun, number, object, or exact line ("the Gospel of Luke,
  its margins full of her handwriting") that lets the reader infer the rest.
- **Flag:** Two failure modes — abstractions with nothing to see ("God moved," "a
  fruitful season"), *and* over-description: stacked mood adjectives ("her
  weathered, hopeful face") or full scene-setting that slows an email down.
- **Self-check:** Is there one concrete, telling detail a reader can picture — and
  have I cut the rest?
- **Coach instruction:** Flag vague summary language and quote it; suggest the
  concrete detail that would replace it. Also flag adjective-stacking or
  over-description and point to the single telling detail worth keeping; prefer
  specific nouns and numbers over mood adjectives. Respect that names/locations
  may be intentionally anonymized — never push the writer to add identifying
  detail.

### STORY-6 Be a Person, Not a Report
- **Coach category:** Storytelling (also Supporter psychology)
- **Checkable:** Partial *(subjective in one letter, but profile-aware over time)*
- **Principle:** Supporters stay for decades because they're connected to a
  person.
- **Good:** A genuine human glimpse — doubt, surprise, a mistake, real feeling.
- **Flag:** Pure institutional voice; the writer is invisible.
- **Self-check:** Did I let myself be a little human here?
- **Coach instruction:** Assess whether the writer is present as a person. If the
  voice is purely institutional, gently note where a human moment would deepen
  connection — and if the profile shows this is a recurring pattern, say so kindly.
  Never demand vulnerability the writer may have reason to withhold.

### STORY-7 Keep the Thread
- **Coach category:** Storytelling
- **Checkable:** Yes *(with the stored profile)*
- **Principle:** Following up turns a series of updates into a relationship.
- **Good:** References an earlier story and gives readers the next installment.
- **Flag:** An open thread from a past letter left hanging.
- **Self-check:** Did I follow up on anything I told supporters before?
- **Coach instruction:** Compare against open story threads in the profile. Praise
  genuine follow-up; gently flag earlier stories that were never resolved, and
  note any new thread worth picking up next time.

### STORY-8 Highlights for Skimmers
- **Coach category:** Storytelling
- **Checkable:** Yes
- **Principle:** Not every reader wants the same depth, and they shouldn't have to
  fight for the headline. This isn't a compromise between "tell the full story"
  and "keep it short" — it lets both readers win: skimmers get the news, loyal
  readers still get the full piece. This matters most for devotional, reflective,
  or context-heavy letters, where real news can end up buried under the writer's
  reflection — and where it's genuinely unclear which one the writer means as the
  point.
- **Good:** A short highlights block near the top (three or four lines) plus any
  prayer requests, with the fuller story or reflection following after, tightened
  per TEXT-4.
- **Flag:** A long letter (devotional, reflective, or otherwise) where real news
  or prayer requests are buried deep in the body with no way to find them quickly.
- **Self-check:** If someone only read the first few lines, would they get the
  news and know how to pray for me?
- **Coach instruction:** When a letter is long or layers significant reflection,
  backstory, or context before the core news, recommend a short highlights/tl;dr
  section up top — the news in brief, plus prayer requests — with the longer
  content kept intact below. Never suggest cutting the reflection or devotional
  content itself; the goal is access for skimmers, not less for engaged readers.
  If it's genuinely ambiguous whether the news or the reflection is the writer's
  main point, say so, and let the highlights block resolve the ambiguity rather
  than forcing a verdict on which one is "the real story."

---

# Lesson 3 — Subject Line & Preview Text

### SUBJ-1 Earns the Open
- **Coach category:** Subject line
- **Checkable:** Yes
- **Principle:** The subject line is the gatekeeper for everything else.
- **Good:** Specific and curiosity-creating; hints at the story inside.
- **Flag:** Generic dated titles — "January Update," "Newsletter #47."
- **Self-check:** Would this subject line make a busy supporter open it?
- **Coach instruction:** Evaluate the subject line. If generic, say so plainly.

### SUBJ-2 Grows from the Story
- **Coach category:** Subject line
- **Checkable:** Yes
- **Principle:** The best subject line is already inside the email.
- **Good:** Pulls a vivid phrase or moment from the actual content.
- **Flag:** A subject disconnected from the letter's real story.
- **Self-check:** Does my subject line come from the actual story I'm telling?
- **Coach instruction:** Draft two or three stronger subject lines drawn directly
  from this email's content, and briefly say why each could work.

### SUBJ-3 Preview Text
- **Coach category:** Subject line
- **Checkable:** Yes
- **Principle:** Preview text is the second line shown in the inbox — free real
  estate most missionaries leave blank or waste on filler like "View this email
  in your browser."
- **Good:** A short line that *extends* the subject's promise rather than
  repeating it, pulling the reader in.
- **Flag:** No preview text set, or default boilerplate ("View in browser," the
  first line of the template).
- **Self-check:** Did I write preview text that adds to my subject line?
- **Coach instruction:** Check whether preview text is present and pulling its
  weight. If it's missing or default filler, flag it and offer up to three
  preview-text options drawn from this email's content.

---

# Lesson 4 — Text & Word Choice

*This lesson owns the words and the tightening: natural language, no jargon, and
making every sentence and paragraph as clear and concise as it can be — without
gutting the story's warmth. Paragraph length lives here (it's an editing
decision); white space lives in Formatting (it's a layout decision). Spelling and
grammar live here too — the writer's own first proofread, before any human or
Coach reviewer.*

### TEXT-1 Natural, Spoken Language
- **Coach category:** Text & Word Choice
- **Checkable:** Yes
- **Principle:** Supporters read in their own head; write the way you'd actually
  talk to them.
- **Good:** Warm, plain, conversational — sounds like you, not a press release.
- **Flag:** Stiff, formal, or corporate phrasing; sentences no one would say out
  loud.
- **Self-check:** Does this sound like me talking to a friend?
- **Coach instruction:** Flag phrasing that reads stiff or corporate and quote a
  more natural version in the writer's own register.

### TEXT-2 No Jargon, Acronyms, or Insider Terms
- **Coach category:** Text & Word Choice
- **Checkable:** Yes
- **Principle:** A word your supporter has to decode is a word that loses them.
- **Good:** Plain language anyone on the list could follow.
- **Flag:** Ministry jargon, acronyms, org-speak, or insider terms a normal
  supporter wouldn't know.
- **Self-check:** Would someone outside my ministry understand every term here?
- **Coach instruction:** Flag jargon, acronyms, and insider terms; quote each and
  suggest a plain replacement.

### TEXT-3 Define What Must Stay
- **Coach category:** Text & Word Choice
- **Checkable:** Yes
- **Principle:** Some terms are worth keeping — if you bring the reader along.
- **Good:** A necessary term is followed by a quick, plain-English definition.
- **Flag:** A kept term left undefined, as if the reader already knows it.
- **Self-check:** Every term I kept — did I define it in a few words?
- **Coach instruction:** Where a necessary term appears undefined, suggest a brief
  parenthetical definition rather than removing the term.

### TEXT-4 As Short and Clear as It Can Be
- **Coach category:** Text & Word Choice
- **Checkable:** Yes
- **Principle:** Cut what doesn't serve the story — but concision serves clarity,
  not brevity for its own sake. A vivid, slightly longer story beats a terse
  summary.
- **Good:** Tight sentences; focused paragraphs (one idea each); nothing padding
  the letter that doesn't earn its place.
- **Flag:** Run-on sentences; long paragraphs cramming several ideas together;
  filler that adds length without adding life.
- **Self-check:** Is each sentence, each paragraph, and the whole email as short
  and clear as it can be — without losing the warmth and detail?
- **Coach instruction:** Quote sentences or paragraphs that could be tightened or
  split and show the tighter version — while protecting vivid, story-serving
  detail. Never push the writer toward dry brevity.

### TEXT-5 Graceful Security Language
- **Coach category:** Text & Word Choice
- **Checkable:** Partial *(intent can be subjective)*
- **Principle:** When safety requires discretion, it should read as natural, not
  cryptic.
- **Good:** Sensitive details handled smoothly — vague where needed, never
  confusing.
- **Flag:** "Security-code" phrasing that's puzzling rather than careful.
- **Self-check:** Where I had to be careful, does it still read clearly?
- **Coach instruction:** Where discretion seems intended, check that it reads
  naturally; if it's cryptic, suggest smoother phrasing — and never push for
  identifying detail the writer may be protecting on purpose.

### TEXT-6 Spelling & Grammar
- **Coach category:** Typos & grammar
- **Checkable:** Yes
- **Principle:** Typos and grammar slips make hard-working people look careless
  and quietly cost them credibility with supporters.
- **Good:** Clean copy; nothing that pulls a reader out of the story.
- **Flag:** Misspellings, obvious grammatical errors, wrong or missing
  punctuation.
- **Self-check:** Did I proofread — ideally by reading it aloud — before sending
  it to anyone, human or Coach?
- **Coach instruction:** List specific spelling and grammar errors as from → to.
  Be brief and matter-of-fact; never imply the writer is careless or
  unintelligent. If the copy is clean, say so in a single line.

---

# Lesson 5 — Images & Graphics  *(Checkable: Yes — with a rendered image)*

*With vision, the Coach can see the email the way a supporter would. Supply a
rendered image of the draft for layout and photo judgment; HTML alone still
covers structure more cheaply.*

- **IMG-1 Mobile-first, single column** — Coach: Readability/formatting · Yes.
  *(canonical home is FMT-1 — cross-reference here, don't double-score)*
- **IMG-2 Compelling, real photography** — Coach: Readability/formatting · Yes
  (with a rendered image or the inline photos). Comment on whether photos are
  present, relevant, and engaging rather than merely decorative. *(to fill)*

---

# Lesson 6 — Formatting

### FMT-1 Single Column, Mobile-First
- **Coach category:** Readability/formatting
- **Checkable:** Yes *(from HTML)*
- **Principle:** Most supporters read on a phone.
- **Good:** One-column layout that reflows cleanly on a small screen.
- **Flag:** Multi-column layouts; fixed-width tables; a PDF newsletter attachment.
- **Self-check:** Does this read well on a phone, in one column?
- **Coach instruction:** Inspect the HTML for multi-column structure or
  PDF/attachment-based layout and flag anything that won't reflow on mobile.

### FMT-2 White Space and Breathing Room
- **Coach category:** Readability/formatting
- **Checkable:** Yes
- **Principle:** A crammed email gets skimmed and abandoned; space invites
  reading.
- **Good:** Generous spacing between blocks and around images; nothing crowded.
- **Flag:** Cramped layout; elements jammed together; no margin around the text.
- **Self-check:** Does anything feel crammed? Is there room to breathe?
- **Coach instruction:** Assess visual spacing and density from the rendered image
  or HTML and flag anything crowded. Leave paragraph *length* to Text (TEXT-4) —
  this is about visual breathing room, not editing.

### FMT-3 Readable Type and Clear Buttons
- **Coach category:** Readability/formatting
- **Checkable:** Yes *(with a rendered image; partial from HTML alone)*
- **Principle:** If it's hard to read or the action is hard to find, it won't get
  done.
- **Good:** Comfortably large text; any call-to-action is an obvious button.
- **Flag:** Tiny type; the only link buried in a sentence.
- **Self-check:** Is the text large enough, and is the next step obvious?
- **Coach instruction:** From a rendered image, judge whether the type is
  comfortably readable and the next step is an obvious button; from HTML alone,
  infer what you can and flag small type or a buried CTA.

### FMT-4 Left-Aligned Long Text
- **Coach category:** Readability/formatting
- **Checkable:** Yes *(with a rendered image; inferable from HTML)*
- **Principle:** Centered blocks of running text are hard to read — the eye loses
  the start of each line.
- **Good:** Longer text is left-aligned; centering reserved for short headings or
  captions.
- **Flag:** Long centered paragraphs.
- **Self-check:** Are my longer text sections left-aligned?
- **Coach instruction:** Flag long centered text blocks and recommend
  left-alignment.

### FMT-5 Length & Deliverability
- **Coach category:** Readability/formatting
- **Checkable:** Yes *(both are calculable from the email itself)*
- **Principle:** A letter that's too heavy gets clipped by Gmail; one that's too
  long gets abandoned. Either way the reader never reaches the end — which is
  often where the prayer asks and the call to action live.
- **Good:** HTML comfortably under Gmail's ~102KB clip threshold; length that
  earns itself — a single, well-told story can run long and still work.
- **Flag:** 🔴 HTML over ~102KB — Gmail clips it and readers won't see anything
  below the cut; 🟠 as it approaches. Separately, a gentle 🟠 when the letter is
  *both* stitching together several competing stories or updates *and* running
  past ~1,000 words — the word count is the backstop, not the trigger; a single
  strong story earns more leeway than several update fragments at the same length.
- **Self-check:** Is this small enough not to get clipped, and short enough that
  someone will actually finish it?
- **Coach instruction:** Report two neutral metrics every time — the HTML byte
  size and the word count with estimated read time (~200–240 wpm). Flag clipping
  risk against the ~102KB threshold. Weigh length together with STORY-1 (one
  story vs several): a long letter built around one well-told story rarely needs
  a length flag, while a long letter stitching together several competing updates
  should be flagged even nearer the ~1,000-word mark. When flagging, offer two
  paths: tighten and reorder so the most important content (the lead, the prayer
  asks, the CTA) sits above the cut, **or** split it into several shorter emails
  sent more often. Never impose a hard word limit — say plainly when a letter has
  earned its length.

---

# Lesson 7 — Mobilizing Prayer  *(stub — Checkable: Yes)*

- **PRAYER-1 Specific, prayable requests** — Coach: Prayer mobilization · Yes.
  Flag vague "please pray for us" with no concrete request. *(to fill)*
- **PRAYER-2 Follow up on past requests** — Coach: Prayer mobilization · Yes
  (with the stored profile). Compare against prayer requests recorded in the
  profile; flag any left without an update. *(to fill)*
- **PRAYER-3 Invite into decisions** — Coach: Prayer mobilization · Yes.
  *(to fill)*

---

# Lesson 8 — Family Updates  *(stub — Checkable: Partial)*

- **FAM-1 A human glimpse of the family** — Coach: Family/the person · Partial.
  *(to fill — presence detectable; boundaries are subjective)*
- **FAM-2 Healthy boundaries** — Coach: Family/the person · Partial. *(to fill)*

---

# Part 3 — The Habits

# Lesson 9 — Review  *(Checkable: No — the human pass)*

*By the time you reach Review, the text should already be tight and proofread
(Lesson 4). This lesson is the part no AI can do for you: hearing your own letter,
and getting a trusted human's eyes on it. The Coach is a powerful first reviewer
for the text itself — but it can't tell you whether this is the right story to
tell, whether it sounds like you, or how real, specific supporters will feel
reading it. So even Coach subscribers should still do this. And clearing the small
stuff first (Lesson 4) is exactly what makes a human reviewer's time worth it —
don't make your spouse hunt for typos.*

### REVIEW-1 Read It Aloud
- **Coach category:** —
- **Checkable:** No *(a writer's own action)*
- **Principle:** Your ear catches what your eye glides over — clunk, run-ons, and
  anything that doesn't sound like you.
- **Good:** You've read the whole thing out loud and fixed what made you stumble.
- **Self-check:** Did I read the whole email out loud?
- **Coach instruction:** *None — out of scope.*

### REVIEW-2 Send a Test to a Spouse or Friend
- **Coach category:** —
- **Checkable:** No *(requires a real human reviewer)*
- **Principle:** Someone who knows you and your supporters can answer what a tool
  can't: is this the right story, in your voice, that your real readers will
  respond to?
- **Good:** A trusted person has weighed in on story, voice, and how named
  supporters might react — plus a fresh set of eyes on anything left.
- **Self-check:** Did I send a test to my spouse or a friend and ask: is this the
  right story, does it sound like us, how will real people react?
- **Coach instruction:** *None — out of scope. The Coach should encourage human
  review, not pretend to replace it.*

### REVIEW-3 Test Your Links and Final Mechanics
- **Coach category:** —
- **Checkable:** No *(the Coach can see whether things are linked, not whether the
  links work)*
- **Principle:** A dead link or wrong URL wastes the one click you asked for.
- **Good:** Every button and link clicked and confirmed before sending.
- **Self-check:** Did I click every link and button?
- **Coach instruction:** *None — link presence may be noted under Formatting, but
  whether links actually work is the writer's pre-send check.*

---

# Lesson 10 — Frequency  *(Checkable: No — example of a non-Coach criterion)*

### FREQ-1 Send When It Matters, ~Every 3–6 Weeks
- **Coach category:** —
- **Checkable:** No — *the Coach is pre-send, so it sees drafts you submit, not
  letters you actually send; submission timing isn't send timing.*
- **Principle:** Meaningful and regular beats filler or long silences.
- **Good:** Letters triggered by something real, on a steady rhythm.
- **Flag:** Monthly filler; quarterly disappearances. *(writer judges this, not
  the Coach)*
- **Self-check:** Am I sending because something happened, on a steady rhythm?
- **Coach instruction:** *None — out of scope. Teach in the course; do not imply
  the Coach evaluates cadence.*

---

# Part 4 — The Ask

# Lesson 11 — The Relational Fundraising Mindset  *(stub — Checkable: mostly No)*

*The philosophy that has to land before the three tactical asking lessons that
follow, or they risk reading as three "how to ask" lessons in a row — exactly the
tone this brand rejects. Frame: asking is an invitation into ministry, not a
transaction. Mostly not Coach-checkable (it's a mindset), but two guardrails from
the old "Raise Money" lesson belong here as cross-cutting principles that apply
to every giving-flavored ask, wherever it appears.*

- **GIVE-1 Relational Over Constant** — Coach: Fundraising/the ask · No (needs
  real send history — the Coach sees one draft, not a pattern across a year).
  *(to fill — the core philosophy of this lesson; teach in course, don't promise
  the Coach checks it)*

### GIVE-2 No Static Footer Ask
- **Coach category:** Fundraising/the ask
- **Checkable:** Partial *(visible in this draft; whether it's truly recurring
  needs the profile/history — but a generic, untargeted footer link is a strong
  single-letter signal on its own)*
- **Principle:** A give-link that appears in every email, regardless of content,
  stops registering as an ask at all — and worse, it quietly inoculates
  supporters against the asks that actually matter. Clear and infrequent beats
  constant and quiet; constant-but-ignorable is worse than not asking.
- **Good:** No ask in non-giving emails, or an ask that's clearly tied to this
  letter's content; when there's a real, occasional ask, it stands out.
- **Flag:** A generic "support our work" link in the footer with no connection to
  this letter's content — especially if the profile shows it's present in every
  letter.
- **Self-check:** Is this link here because this letter has a real ask, or just
  because it's always there?
- **Coach instruction:** Flag a generic, content-unconnected give-link sitting in
  the footer of a non-giving email. Name the mechanism plainly but kindly: a
  constant, untargeted ask trains supporters to scroll past it, which costs you
  exactly when you need a real ask to land. Recommend removing it from routine
  updates and saving a clear ask for when there's a genuine, specific need.

*Note: `GIVE-3` (clear, well-placed ask) and `GIVE-4` (donor-fatigue signals) are
reserved for lesson-specific criteria to be written under Year-End Giving,
One-Time & Special Needs, and Increasing Monthly Support — each kind of ask has
its own shape, so those criteria belong in their own lessons rather than being
forced into one generic version here.*

---

# Lesson 12 — Year-End Giving  *(stub — Checkable: Partial, not yet written)*

*Awaiting lesson-specific criteria — e.g. is "Year-End Giving" (or similar)
signaled in the subject; is the seasonal ask clear and well-placed; is the CTA
button's destination described with clear instructions (account/designation
code, etc.).*

---

# Lesson 13 — One-Time & Special Needs  *(stub — Checkable: Partial, not yet written)*

*Awaiting lesson-specific criteria — e.g. is the specific need named plainly; is
the amount or goal clear if shared; is there a clean way to signal when the need
is met.*

---

# Lesson 14 — Increasing Monthly Support  *(stub — Checkable: Partial, not yet written)*

*Awaiting lesson-specific criteria — e.g. is the ask for recurring vs. one-time
support unambiguous; is the "why monthly" case made without pressure.*

---

# Part 5 — The Future

# Lesson 15 — Grow Your Email List  *(stub — Checkable: No)*

- **GROW-1 QR codes / events / conversations** — Coach: — · No. *(teach only)*

---

# Bonus Material  *(stub — Checkable: No)*

- **BONUS-1 Messaging vs Email** — Coach: — · No. *(teach only)*
- **BONUS-2 Choosing an Email Provider** (Mailchimp, Kit, Prayvine, Epistle) —
  Coach: — · No. *(teach only — keep as a living, updatable reference rather than
  a video, since providers and features change.)*

---

## Working notes

- **Stable slugs, not lesson numbers.** Criterion IDs (`STORY-1`, `FMT-2`, etc.)
  are permanent and independent of lesson position. The course outline table
  above is the only place lesson *order* lives — reorder freely there without
  touching a single ID, cross-reference, or Coach-prompt line below.
- **Pre-send only.** The Coach reviews drafts before they go out. We deliberately
  do *not* encourage adding the review address to a live supporter list — by the
  time the Coach saw a live send, the letter would already be out, which defeats
  the entire point of pre-send coaching.
- **Two profile layers** (see Data model): declared context the user opts to
  share, and derived patterns the Coach learns. Both feed every evaluation.
- **Data care.** Profile data — especially region, organization, and family — is
  sensitive for this audience. Keep it optional, encourage non-identifying
  phrasing, store it securely, and make deletion easy. This is a trust product
  first.
- **Resolve overlaps before they multiply.** A few criteria want to live in two
  places (`IMG-1` ↔ `FMT-1` mobile layout; `STAKES-1` ↔ Supporter psychology;
  `STORY-7` ↔ `PRAYER-2` follow-up). Pick one canonical home for each and
  cross-reference the other, so the Coach never evaluates the same thing twice.
  *Resolved so far:* paragraph length lives in Text (`TEXT-4`), white space in
  Formatting (`FMT-2`); spelling & grammar lives in Text (`TEXT-6`), and Review
  (Lesson 9) is now purely the human pass.
- **Supporter psychology has no lesson of its own** but is a Coach category. Its
  criteria currently scatter across `STAKES-1`, `STORY-6`, and `FAM-*`. Decide
  whether to give it a dedicated section here even though it isn't a standalone
  lesson.
- **The Ask module (Lessons 11–14) needs lesson-specific criteria.** The old
  generic "Raise Money" stub was split across four lessons; only the two
  cross-cutting guardrails (`GIVE-1`, `GIVE-2`) have been written so far. Each of
  Year-End Giving, One-Time & Special Needs, and Increasing Monthly Support needs
  its own criteria once those lessons are drafted.
- **When you write a new lesson:** add its criteria here first with a new slug
  prefix, set the Checkable flag honestly, then let the self-checks and the Coach
  prompt regenerate from it.
