"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, User, Search, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { computeMatch, type OpportunityForMatch } from "@/lib/marketplace";
import { SKILL_OPTIONS, TASK_TYPE_OPTIONS } from "@/lib/data/marketplace-options";
import { DEMO_STUDENT_NAME, DEMO_STUDENT_SUBTITLE, DEMO_STUDENT_PROFILE } from "./demoStudentProfile";
import type { PostedOpportunity } from "./types";

const STEPS = ["profile", "browse", "apply", "applied"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  profile: "Your details",
  browse: "Browse opportunities",
  apply: "Apply",
  applied: "Applied",
};

const STEP_ICON: Record<Step, React.ComponentType<{ size?: number }>> = {
  profile: User,
  browse: Search,
  apply: Send,
  applied: CheckCircle2,
};

const CARD = "rounded-cards bg-carbon p-6 shadow-subtle sm:p-8";

const FALLBACK_OPPORTUNITY: OpportunityForMatch & { title: string; description: string; taskType: string } = {
  title: "Reducing missed VTE risk assessments on the cardiology ward",
  description:
    "Second cycle of a QIP re-auditing VTE risk assessment completion within 14 hours of admission, following a poster intervention last cycle. Looking for a student to help with data collection, re-audit, and write-up.",
  taskType: "qip",
  specialty: null,
  hospital_trust: "Chelsea and Westminster Hospital NHS Foundation Trust",
  deanery_region: null,
  min_year_of_study: null,
  required_skills: ["data_collection"],
  preferred_skills: ["excel", "statistics"],
  experience_level: "some_experience",
  estimated_commitment: "2-5h",
};

const OTHER_OPPORTUNITIES: (OpportunityForMatch & { title: string; description: string; taskType: string })[] = [
  {
    title: "Audit of antibiotic prescribing in the emergency department",
    description:
      "Reviewing compliance with local antimicrobial guidelines for community-acquired pneumonia. Good first audit: full training and supervision provided.",
    taskType: "audit",
    specialty: null,
    hospital_trust: "Charing Cross Hospital",
    deanery_region: null,
    min_year_of_study: null,
    required_skills: ["governance_training"],
    preferred_skills: ["literature_review"],
    experience_level: "no_experience_needed",
    estimated_commitment: "2-5h",
  },
  {
    title: "Systematic review support: prehabilitation before cardiac surgery",
    description:
      "Screening abstracts and extracting data for a systematic review on pre-operative exercise programmes. Co-authorship on the resulting paper.",
    taskType: "research",
    specialty: null,
    hospital_trust: "Royal Brompton Hospital",
    deanery_region: null,
    min_year_of_study: null,
    required_skills: ["literature_review"],
    preferred_skills: ["manuscript_writing"],
    experience_level: "some_experience",
    estimated_commitment: "5-10h",
  },
];

const OTHER_APPLICANTS = [
  { initials: "JP", name: "Jamie Patel", detail: "Year 5 · King's College London", percent: 74 },
  { initials: "RK", name: "Riya Kaur", detail: "Year 3 · UCL", percent: 61 },
];

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 16 : -16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -16 : 16 }),
};

function skillLabel(value: string): string {
  return SKILL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function StudentWalkthrough({
  onExit,
  postedOpportunity,
}: {
  onExit: () => void;
  postedOpportunity: PostedOpportunity | null;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = STEPS[stepIndex];
  const StepIcon = STEP_ICON[step];
  const [coverNote, setCoverNote] = useState(
    "I've been involved in a VTE-prevention QI project on my current placement and I'm confident with Excel and basic statistics, happy to help with data collection or the re-audit."
  );

  const featured = useMemo(() => {
    if (!postedOpportunity) return FALLBACK_OPPORTUNITY;
    return {
      title: postedOpportunity.title,
      description: postedOpportunity.description,
      taskType: postedOpportunity.taskType,
      specialty: null,
      hospital_trust: postedOpportunity.hospitalTrust,
      deanery_region: null,
      min_year_of_study: postedOpportunity.minYearOfStudy,
      required_skills: postedOpportunity.requiredSkills,
      preferred_skills: postedOpportunity.preferredSkills,
      experience_level: postedOpportunity.experienceLevel,
      estimated_commitment: postedOpportunity.estimatedCommitment,
    };
  }, [postedOpportunity]);

  const listings = useMemo(() => {
    const all = [featured, ...OTHER_OPPORTUNITIES];
    return all
      .map((o) => ({ opportunity: o, match: computeMatch(o, DEMO_STUDENT_PROFILE) }))
      .sort((a, b) => b.match.percent - a.match.percent);
  }, [featured]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const selected = listings[selectedIndex];

  function goNext() {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function goBack() {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function restart() {
    setDirection(-1);
    setStepIndex(0);
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1 text-caption text-ash transition-colors hover:text-fog"
      >
        <ArrowLeft size={13} /> All demos
      </button>

      <div className="mt-4 inline-flex items-center gap-2 rounded-pills bg-black/[0.045] px-3 py-[6px] text-label text-fog">
        <span className="h-1.5 w-1.5 rounded-full bg-iris-violet" />
        Demo: nothing you enter here is saved
      </div>

      <h1 className="mt-4 text-heading-sm font-serif font-normal text-paper">
        Finding an opportunity, as a student
      </h1>
      <p className="mt-2 text-body-sm text-fog">
        {postedOpportunity
          ? "The opportunity you just posted is now visible here, matched against a student profile, exactly as it would appear for real."
          : "This is what a medical student or foundation doctor sees when they open Hitch. No account needed to look around."}
      </p>

      {step !== "applied" && (
        <div className="mt-8 flex items-center gap-3">
          <p className="flex items-center gap-1.5 text-caption text-ash">
            <StepIcon size={13} />
            Step {stepIndex + 1} of {STEPS.length - 1} · {STEP_LABEL[step]}
          </p>
          <div className="h-1 max-w-32 flex-1 overflow-hidden rounded-pills bg-graphite">
            <div
              className="h-full rounded-pills bg-acid-lime transition-[width] duration-300"
              style={{ width: `${((stepIndex + 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={`${CARD} mt-3 overflow-hidden`}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {step === "profile" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Your profile</p>
                <p className="mt-1 text-caption text-ash">
                  Structured once, used for every match. This is what posters see when you apply.
                </p>
                <div className="mt-5 flex items-center gap-4 rounded-inputs border border-graphite bg-black/[0.02] p-4">
                  <div className="h-12 w-12 shrink-0 rounded-pills bg-acid-lime/15 flex items-center justify-center text-[17px] font-[510] text-acid-lime">
                    SO
                  </div>
                  <div>
                    <p className="font-[510] text-paper">{DEMO_STUDENT_NAME}</p>
                    <p className="text-caption text-fog">{DEMO_STUDENT_SUBTITLE}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-inputs border border-graphite bg-black/[0.02] p-3">
                    <p className="text-caption text-ash">QI experience</p>
                    <p className="mt-0.5 text-body-sm text-mist">Assisted on a QI project</p>
                  </div>
                  <div className="rounded-inputs border border-graphite bg-black/[0.02] p-3">
                    <p className="text-caption text-ash">Availability</p>
                    <p className="mt-0.5 text-body-sm text-mist">2–5 hours/week</p>
                  </div>
                </div>
                <div className="mt-3 rounded-inputs border border-graphite bg-black/[0.02] p-3">
                  <p className="text-caption text-ash">Skills</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {DEMO_STUDENT_PROFILE.skills?.map((s) => (
                      <span key={s} className="rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">
                        {skillLabel(s)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "browse" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Open opportunities</p>
                <p className="mt-1 text-caption text-ash">Ranked by how well they match your profile.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
                  <div className="space-y-2">
                    {listings.map(({ opportunity, match }, i) => (
                      <button
                        key={opportunity.title}
                        onClick={() => setSelectedIndex(i)}
                        className={`relative w-full rounded-inputs border bg-black/[0.015] p-3 text-left transition-colors ${
                          i === selectedIndex ? "border-transparent" : "border-graphite hover:border-smoke"
                        }`}
                      >
                        {i === selectedIndex && (
                          <motion.span
                            layoutId="demo-listing-selection"
                            className="absolute inset-0 rounded-inputs border border-acid-lime bg-acid-lime/5"
                            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <div className="relative">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-caption font-[510] text-paper">{opportunity.title}</p>
                          </div>
                          <span className="mt-1 inline-block rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                            {match.percent}% match
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                  {selected && (
                    <motion.div
                      key={selected.opportunity.title}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                      transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-inputs border border-graphite bg-black/[0.015] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-[510] text-paper">{selected.opportunity.title}</p>
                        <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                          {selected.match.percent}% match
                        </span>
                      </div>
                      <p className="mt-1 text-caption text-fog">
                        {selected.opportunity.hospital_trust} ·{" "}
                        {TASK_TYPE_OPTIONS.find((t) => t.value === selected.opportunity.taskType)?.label}
                      </p>
                      <p className="mt-3 text-body-sm text-mist">{selected.opportunity.description}</p>
                      {selected.match.checks.length > 0 && (
                        <ul className="mt-4 space-y-1 border-t border-graphite pt-3">
                          {selected.match.checks.map((c) => {
                            const unmetRequired = c.required && !c.met;
                            return (
                              <li key={c.label} className="flex items-center gap-2 text-body-sm">
                                <span className={c.met ? "text-pulse-green" : unmetRequired ? "text-coral-red" : "text-ash"}>
                                  {c.met ? "✓" : "○"}
                                </span>
                                <span className={c.met ? "text-mist" : unmetRequired ? "text-coral-red" : "text-ash"}>
                                  {c.label}
                                  {c.required && <span className="ml-1 text-label text-ash">(required)</span>}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {step === "apply" && selected && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Apply to {selected.opportunity.title}</p>
                <p className="mt-1 text-caption text-ash">
                  Your profile is attached automatically. Just add a short note.
                </p>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="mt-4 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
                />
              </div>
            )}

            {step === "applied" && selected && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pulse-green" />
                  <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Application sent</p>
                </div>
                <p className="mt-1 text-body-sm text-fog">
                  {`${selected.opportunity.hospital_trust?.split(" NHS")[0]} will be in touch if you're shortlisted.`}
                </p>

                <div className="mt-6 rounded-cards border border-dashed border-graphite p-5">
                  <p className="text-[14px] font-[510] text-paper">What the poster sees on their end</p>
                  <p className="mt-1 text-caption text-ash">
                    A ranked shortlist instead of a pile of emails. {DEMO_STUDENT_NAME.split(" ")[0]}&apos;s
                    application lands right at the top.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-3 rounded-inputs border border-acid-lime/40 bg-acid-lime/[0.06] p-3">
                      <div className="h-9 w-9 shrink-0 rounded-pills bg-acid-lime/15 flex items-center justify-center text-[13px] font-[510] text-acid-lime">
                        SO
                      </div>
                      <div className="flex-1">
                        <p className="text-body-sm font-[510] text-paper">{DEMO_STUDENT_NAME}</p>
                        <p className="text-caption text-fog">{DEMO_STUDENT_SUBTITLE}</p>
                      </div>
                      <span className="shrink-0 rounded-badges bg-acid-lime/20 px-[6px] text-label font-[510] text-acid-lime">
                        {selected.match.percent}% match
                      </span>
                    </div>
                    {OTHER_APPLICANTS.map((a) => (
                      <div key={a.name} className="flex items-center gap-3 rounded-inputs border border-graphite bg-black/[0.015] p-3 opacity-70">
                        <div className="h-9 w-9 shrink-0 rounded-pills bg-black/[0.045] flex items-center justify-center text-[13px] font-[510] text-fog">
                          {a.initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-body-sm font-[510] text-mist">{a.name}</p>
                          <p className="text-caption text-ash">{a.detail}</p>
                        </div>
                        <span className="shrink-0 rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">
                          {a.percent}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={restart} variant="secondary">
                    Restart demo
                  </Button>
                  <Button href="/marketplace" variant="primary">
                    Browse real opportunities
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step !== "applied" && (
          <div className="mt-8 flex items-center justify-between border-t border-graphite pt-6">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist disabled:opacity-0"
            >
              Back
            </button>
            <button
              onClick={goNext}
              className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
            >
              {step === "apply" ? "Send application" : "Next"}
            </button>
          </div>
        )}
      </div>

      {step !== "applied" && (
        <p className="mt-4 text-center text-caption text-ash">
          <Link href="/" className="underline hover:text-fog">
            Skip the demo, go to Hitch
          </Link>
        </p>
      )}
    </main>
  );
}
