import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";

const MOCK_MATCH_CHECKS = [
  { label: "Year 3+", met: true, required: true },
  { label: "Interested in Endocrinology", met: true, required: false },
  { label: "Excel / data management", met: true, required: false },
  { label: "Available 3–5h/week", met: true, required: false },
  { label: "Previous QI experience", met: false, required: false },
];

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
    label:
      "students paired with audit supervisors in a UK pilot, which improved confidence and got projects disseminated locally and nationally",
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
    body: "Students and foundation doctors see an explainable match score against their own structured profile. No CV trawling, no relying on who they happen to know.",
  },
  {
    step: "3",
    title: "Deliver",
    body: "The poster reviews a ranked shortlist, picks who to work with, and can verify what the student actually contributed once the project's done.",
  },
];

const EXPLORE_CARDS = [
  {
    href: "/marketplace",
    audience: "Students & foundation doctors",
    title: "Find an opportunity",
    body: "Browse open QIPs, audits, research tasks, and presentations near you, ranked by how well they match your profile.",
    cta: "Browse opportunities",
  },
  {
    href: "/marketplace/post",
    audience: "Consultants, registrars & QI teams",
    title: "Post an opportunity",
    body: "Get help with the project that's been sitting on your list: data collection, literature review, patient recruitment, or a QI cycle you don't have time to run alone.",
    cta: "Post an opportunity",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-24">
      <section className="lg:flex lg:items-center lg:gap-16">
        <div className="max-w-2xl lg:flex-1">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-pills bg-black/[0.045] px-3 py-[6px] text-label text-fog">
              <span className="h-1.5 w-1.5 rounded-full bg-pulse-green" />
              Live: QIP, audit & research matching
            </span>

            <h1 className="mt-4 text-[36px] leading-[1.15] tracking-[-0.3px] font-serif font-normal text-paper sm:text-heading-lg">
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
              className="mt-4 inline-flex items-center gap-1 text-[13px] font-[510] text-mist underline hover:text-paper"
            >
              Not ready to sign in? Try the interactive demo <ArrowRight size={13} />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.22} className="mt-16 lg:mt-0 lg:w-[380px] lg:shrink-0">
          <div className="rounded-cards bg-carbon p-6 shadow-subtle">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-[510] text-paper">Improving inpatient insulin prescribing</p>
                <p className="mt-1 text-caption text-fog">Endocrinology · QIP · 3 months · Hybrid</p>
              </div>
              <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                92% match
              </span>
            </div>
            <ul className="mt-4 space-y-2 border-t border-graphite pt-4">
              {MOCK_MATCH_CHECKS.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-body-sm">
                  <span className={c.met ? "text-pulse-green" : "text-ash"}>{c.met ? "✓" : "○"}</span>
                  <span className={c.met ? "text-mist" : "text-ash"}>
                    {c.label}
                    {c.required && <span className="ml-1 text-label text-ash">(required)</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-caption text-ash">
              Illustrative example. Real postings show your own match score.
            </p>
          </div>
        </Reveal>
      </section>

      <div className="mt-24 grid gap-6 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="h-full rounded-cards bg-carbon p-6 shadow-subtle">
              <p className="text-heading-sm font-serif font-normal text-paper">{s.value}</p>
              <p className="mt-2 text-body-sm text-mist">{s.label}</p>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-caption text-ash underline decoration-smoke underline-offset-2 transition-colors hover:text-fog"
              >
                {s.source}
              </a>
            </div>
          </Reveal>
        ))}
      </div>

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

      <div className="mt-24 grid gap-6 sm:grid-cols-2">
        {EXPLORE_CARDS.map((card, i) => (
          <Reveal key={card.href} delay={i * 0.08}>
            <Link
              href={card.href}
              className="flex h-full flex-col rounded-cards bg-carbon p-6 shadow-subtle transition-[box-shadow,transform] duration-200 hover:-translate-y-[2px] hover:shadow-[0_0_0_1px_var(--color-smoke)_inset]"
            >
              <p className="text-caption text-ash">{card.audience}</p>
              <h2 className="mt-1 text-[17px] font-[510] text-paper">{card.title}</h2>
              <p className="mt-2 text-body-sm text-fog">{card.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-[510] text-mist">
                {card.cta} <ArrowRight size={14} />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
