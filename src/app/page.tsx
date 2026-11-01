import Link from "next/link";
import { ArrowRight, Building2, Check, ListOrdered, Mail } from "lucide-react";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import HeroAccordion from "@/components/HeroAccordion";

const STATS = [
  {
    value: "30%",
    label: "of audits foundation doctors start are ever completed",
    source: "Cai et al., UK junior doctors' experience of clinical audit, BJMP 2009",
    href: "https://www.bjmp.org/content/uk-junior-doctors-experience-clinical-audit-foundation-programme",
  },
  {
    value: "69%",
    label:
      "of medical students want to do more research, and the barrier they name most often is simply not knowing what is available",
    source: "SMART study, 1,774 students across 40 UK medical schools, BMC Medical Education 2023",
    href: "https://doi.org/10.1186/s12909-023-04881-2",
  },
  {
    value: "19",
    unit: "students",
    label:
      "were paired with audit supervisors in a UK pilot, which improved confidence and got projects disseminated locally and nationally",
    source: "Kumar et al., Clinical Audit Platform for Students, Postgraduate Medical Journal 2021",
    href: "https://doi.org/10.1136/postgradmedj-2020-138426",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Post",
    body: "A consultant, registrar, or QI team lists a QIP, audit, research task, or presentation opportunity: required vs. preferred criteria, estimated commitment, and deadline.",
  },
  {
    step: "2",
    title: "Match",
    body: "Students and foundation doctors see an explainable match score against their own structured profile.",
  },
  {
    step: "3",
    title: "Deliver",
    body: "The poster reviews a ranked shortlist and picks who to work with.",
  },
];

// Each point is something the product does today (board shows department and hospital only, the
// poster's dashboard ranks applicants with reasons, status is the poster's call, and the poster's
// email is only revealed to an accepted applicant).
const POSTER_POINTS = [
  {
    icon: Building2,
    title: "Department, not you",
    body: "Your post shows your department and hospital. Never your name, photo or GMC number.",
  },
  {
    icon: ListOrdered,
    title: "A ranked shortlist",
    body: "Applicants are ranked by how well they fit what you asked for, with the reasons shown.",
  },
  {
    icon: Check,
    title: "You decide",
    body: "Shortlist, accept or decline each applicant. Hitch never picks for you.",
  },
  {
    icon: Mail,
    title: "Email only when you accept",
    body: "An applicant gets your email only after you accept them.",
  },
];

// A made-up audit shown the way the marketplace shows a match: ticks for what is met, red for what is
// missing. No percentage, because any figure here would be invented.
const MATCH_EXAMPLE = {
  title: "Re-audit: VTE risk assessment completed within a day of admission",
  department: "General Surgery",
  checks: [
    { label: "Excel", met: true, required: true },
    { label: "Statistics", met: true, required: true },
    { label: "Available 2\u20135h/week", met: true, required: false },
    { label: "Led an audit before", met: false, required: false },
  ],
  shortlist: [
    { name: "Applicant A", has: [true, true, true, true] },
    { name: "Applicant B", has: [true, true, true, false] },
    { name: "Applicant C", has: [true, false, true, false] },
  ],
};

function ExampleTag() {
  return (
    <span className="rounded-badges border border-smoke px-2 text-label font-[600] text-fog">Example</span>
  );
}

// Colour is never the only signal: a tick or a cross carries the meaning, with a screen-reader word.
function Mark({ met }: { met: boolean }) {
  return (
    <span className={`w-4 shrink-0 text-center ${met ? "text-pulse-green" : "text-coral-red"}`}>
      <span aria-hidden="true">{met ? "\u2713" : "\u2715"}</span>
      <span className="sr-only">{met ? "Has:" : "Missing:"}</span>
    </span>
  );
}

export default function Home() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-24">
      <section className="lg:flex lg:items-center lg:gap-16">
        <div className="max-w-2xl lg:flex-1">
          <Reveal>
            <h1 className="text-[36px] leading-[1.15] tracking-[-0.3px] font-serif font-normal text-paper sm:text-heading-lg">
              Get your QIP, audit, or research project actually done.
            </h1>
            <p className="mt-6 max-w-lg text-body text-mist">
              A structured way for hospitals and consultants to find willing, matched student and
              trainee help, and for students and foundation doctors to find real opportunities,
              not just whoever they happen to know.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/marketplace" size="lg" iconTrailing={<ArrowRight size={16} />}>
                Browse opportunities
              </Button>
              <Link
                href="/marketplace/post"
                className="rounded-buttons border border-graphite px-5 py-[13px] text-[14px] font-[510] text-mist transition-colors hover:border-smoke hover:text-paper"
              >
                Post an opportunity
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <Link
              href="/demo"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-[14px] font-[510] text-mist underline hover:text-paper"
            >
              Not ready to sign in? See a demo <ArrowRight size={13} />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.22} className="mt-12 lg:mt-0 lg:w-[540px] lg:shrink-0 xl:w-[640px]">
          <HeroAccordion />
        </Reveal>
      </section>

      <div className="mt-24">
        <Reveal>
          <h2 className="text-subheading font-serif font-normal text-paper">How it works</h2>
        </Reveal>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s, i) => (
            <Reveal key={s.step} delay={0.08 + i * 0.08}>
              <span className="text-caption font-[510] text-acid-lime">Step {s.step}</span>
              <h3 className="mt-1 text-[17px] font-[510] text-paper">{s.title}</h3>
              <p className="mt-2 text-body-sm text-fog">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="text-subheading font-serif font-normal text-paper">See what a match looks like</h2>
          <p className="mt-2 max-w-[62ch] text-body-sm text-fog">
            Every opportunity lists what it needs. You see exactly how your profile lines up, and the
            poster sees a short ranked list with the reasons, so nobody has to screen everyone.
          </p>
        </Reveal>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-cards bg-carbon p-7 shadow-subtle">
              <div className="flex items-center justify-between text-caption text-ash">
                <span>What an applicant sees</span>
                <ExampleTag />
              </div>
              <span className="mt-4 inline-flex items-center gap-[6px] rounded-badges bg-[#05808f14] px-[10px] py-[2px] text-caption font-[600] text-[#0a6c78]">
                <span aria-hidden="true" className="size-[6px] rounded-full bg-[#0a6c78]" />
                Audit
              </span>
              <h3 className="mt-3 text-[19px] font-[510] leading-[1.35] text-paper">{MATCH_EXAMPLE.title}</h3>
              <p className="text-body-sm text-fog">{MATCH_EXAMPLE.department}</p>
              <h4 className="mt-5 text-body-sm font-[510] text-paper">How this lines up with your profile</h4>
              <p className="mt-1 text-caption text-ash">A guide, not a gate. You can apply regardless.</p>
              <ul className="mt-2">
                {MATCH_EXAMPLE.checks.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-baseline gap-[10px] border-t-[0.5px] border-graphite py-2 text-body-sm first:border-t-0"
                  >
                    <Mark met={c.met} />
                    <span className={c.met ? "text-mist" : "text-coral-red"}>{c.label}</span>
                    {c.required && (
                      <span className="ml-auto shrink-0 rounded-badges border border-smoke px-2 text-[13px] font-[510] text-paper">
                        Required
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-body-sm font-[510] text-pulse-green">Every requirement met</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full rounded-cards bg-carbon p-7 shadow-subtle">
              <div className="flex items-center justify-between text-caption text-ash">
                <span>What the poster sees</span>
                <ExampleTag />
              </div>
              <h4 className="mt-4 text-body-sm font-[510] text-paper">Your shortlist for this audit</h4>
              <p className="mt-1 text-caption text-ash">Ranked by fit. You choose who to work with.</p>
              <ol className="mt-4 grid gap-3">
                {MATCH_EXAMPLE.shortlist.map((a, i) => (
                  <li
                    key={a.name}
                    className={`flex gap-[14px] rounded-[14px] border p-4 ${
                      i === 0 ? "border-pulse-green/40 bg-pulse-green/[0.06]" : "border-graphite"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[14px] font-[600] ${
                        i === 0 ? "bg-pulse-green text-white" : "bg-black/[0.06] text-paper"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-[510] text-paper">{a.name}</p>
                      <ul className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                        {MATCH_EXAMPLE.checks.map((c, j) => (
                          <li key={c.label} className="flex items-baseline gap-[6px] text-[14px]">
                            <Mark met={a.has[j]} />
                            <span className={a.has[j] ? "text-mist" : "text-coral-red"}>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-24 rounded-cards bg-carbon p-6 shadow-subtle sm:p-9">
        <Reveal>
          <h2 className="text-subheading font-serif font-normal text-paper">Got a project that needs help?</h2>
          <p className="mt-2 max-w-[62ch] text-body-sm text-fog">
            For a doctor, a QI lead or a team with a QIP, audit or research task that is stalling.
            Posting is quick, and you stay in control.
          </p>
        </Reveal>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POSTER_POINTS.map((pt, i) => (
            <li key={pt.title}>
              <Reveal delay={i * 0.06}>
                <pt.icon size={22} strokeWidth={1.7} aria-hidden="true" className="text-acid-lime" />
                <h3 className="mt-3 text-[16px] font-[510] text-paper">{pt.title}</h3>
                <p className="mt-[6px] text-body-sm text-fog">{pt.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/marketplace/post" size="lg">
            Post an opportunity
          </Button>
          <Button href="/demo" variant="secondary" size="lg">
            See a demo
          </Button>
        </div>
        <p className="mt-4 text-caption text-ash">Sign-in is limited to NHS and university email addresses.</p>
      </section>

      <section className="mt-24">
        <Reveal>
          <h2 className="text-subheading font-serif font-normal text-paper">Why this exists</h2>
        </Reveal>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="h-full rounded-cards bg-carbon p-6 shadow-subtle">
                <p className="text-heading-sm font-serif font-normal text-paper">
                  {s.value}
                  {s.unit && <span className="ml-2 font-sans text-body-sm font-[510] text-fog">{s.unit}</span>}
                </p>
                <p className="mt-2 text-body-sm text-mist">{s.label}</p>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex min-h-[44px] items-center text-caption text-ash underline decoration-smoke underline-offset-2 transition-colors hover:text-fog"
                >
                  {s.source}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-cards bg-carbon px-6 py-4 shadow-subtle">
        <Reveal>
          <p className="text-body font-[510] text-paper">Looking for a project to join?</p>
        </Reveal>
        <Button href="/marketplace" size="lg" iconTrailing={<ArrowRight size={16} />}>
          Browse opportunities
        </Button>
      </section>
    </main>
  );
}
