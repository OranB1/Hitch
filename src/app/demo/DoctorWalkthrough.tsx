"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Building2, ClipboardList, ListChecks, Clock, Eye, Users } from "lucide-react";
import { Button } from "@/components/Button";
import {
  TASK_TYPE_OPTIONS,
  SKILL_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  AVAILABILITY_OPTIONS,
  PROJECT_DURATION_OPTIONS,
  type TaskType,
  type Skill,
  type ExperienceLevel,
  type AvailabilityHours,
} from "@/lib/data/marketplace-options";
import type { OpportunityForMatch } from "@/lib/marketplace";
import { STAGE_OPTIONS, stageLabel } from "@/lib/data/onboarding-options";
import { rankDemoApplicants } from "./demoApplicants";
import { DemoCardBody, DEMO_CARD_CLASS } from "./DemoCard";
import type { PostedOpportunity } from "./types";

// No "who's posting" step: it showed a made-up consultant's name, and posts on the board are
// attributed to a hospital only. The walkthrough ends on the part that saves a poster time, the
// ranked list of who applied.
const STEPS = ["hospital", "basics", "requirements", "commitment", "preview", "posted"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  hospital: "Your hospital",
  basics: "What are you posting?",
  requirements: "What do you need?",
  commitment: "Commitment",
  preview: "Preview",
  posted: "Who applied",
};

const STEP_ICON: Record<Step, React.ComponentType<{ size?: number }>> = {
  hospital: Building2,
  basics: ClipboardList,
  requirements: ListChecks,
  commitment: Clock,
  preview: Eye,
  posted: Users,
};

type DemoStatus = "shortlisted" | "accepted" | "declined";
const STATUS_PILL: Record<DemoStatus, string> = {
  shortlisted: "bg-iris-violet/15 text-iris-violet",
  accepted: "bg-pulse-green/15 text-[#13633a]",
  declined: "bg-black/[0.045] text-ash",
};
const STATUS_LABEL: Record<DemoStatus, string> = {
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  declined: "Declined",
};
const ACTION_BTN = "inline-flex min-h-[44px] items-center rounded-buttons px-4 text-[14px] transition-colors";

const CARD = "rounded-cards bg-carbon p-6 shadow-subtle sm:p-8";
const INPUT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] min-h-[44px] px-[14px] py-[12px] text-[16px] text-mist focus:border-mist focus:outline-none";
const CHIP_BASE = "inline-flex min-h-[44px] items-center rounded-pills border px-4 text-[14px] transition-colors";
const CHIP_ON = "border-acid-lime bg-acid-lime/10 text-paper";
const CHIP_OFF = "border-graphite text-mist hover:border-smoke";

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 16 : -16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -16 : 16 }),
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function DoctorWalkthrough({
  onExit,
  onPosted,
  onSeeStudentSide,
}: {
  onExit: () => void;
  onPosted: (opportunity: PostedOpportunity) => void;
  onSeeStudentSide: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = STEPS[stepIndex];
  const StepIcon = STEP_ICON[step];

  const [hospitalTrust, setHospitalTrust] = useState("Charing Cross Hospital");
  const [isRemote, setIsRemote] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>("qip");
  const [title, setTitle] = useState("Reducing missed VTE risk assessments on the cardiology ward");
  const [description, setDescription] = useState(
    "Second cycle of a QIP re-auditing VTE risk assessment completion within 14 hours of admission, following a poster intervention last cycle. Looking for a student to help with data collection, re-audit, and write-up."
  );
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>(["data_collection"]);
  const [preferredSkills, setPreferredSkills] = useState<Skill[]>(["excel", "statistics"]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("some_experience");
  const [minYearOfStudy, setMinYearOfStudy] = useState("3");
  const [estimatedCommitment, setEstimatedCommitment] = useState<AvailabilityHours>("2-5h");
  const [duration, setDuration] = useState("1–3 months");
  const [statuses, setStatuses] = useState<Record<string, DemoStatus>>({});

  function goNext() {
    if (step === "preview") {
      onPosted({
        title,
        description,
        hospitalTrust,
        isRemote,
        taskType,
        requiredSkills,
        preferredSkills,
        experienceLevel,
        minYearOfStudy,
        estimatedCommitment,
        durationLabel: `${AVAILABILITY_OPTIONS.find((o) => o.value === estimatedCommitment)?.label} for ${duration}`,
      });
    }
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
    setStatuses({});
  }

  const location = isRemote ? "Remote / virtual" : hospitalTrust || "Location not specified";
  const cardFacts = [`${estimatedCommitment}/week`, duration];
  const opportunityForMatch: OpportunityForMatch = {
    specialty: null,
    hospital_trust: isRemote ? null : hospitalTrust || null,
    deanery_region: null,
    min_year_of_study: minYearOfStudy,
    required_skills: requiredSkills,
    preferred_skills: preferredSkills,
    experience_level: experienceLevel,
    estimated_commitment: estimatedCommitment,
  };
  const applicants = rankDemoApplicants(opportunityForMatch);

  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <button
        onClick={onExit}
        className="flex min-h-[44px] items-center gap-1 text-[14px] text-ash transition-colors hover:text-fog"
      >
        <ArrowLeft size={14} /> All demos
      </button>

      <div className="inline-flex items-center gap-2 rounded-pills bg-black/[0.045] px-3 py-[6px] text-label text-fog">
        <span className="h-1.5 w-1.5 rounded-full bg-iris-violet" />
        Demo: example opportunities, nothing you enter here is saved
      </div>

      <h1 className="mt-4 text-heading-sm font-serif font-normal text-paper">
        Posting an opportunity, as a doctor
      </h1>
      <p className="mt-2 text-body-sm text-fog">
        This is what posting looks like for a consultant, registrar or QI lead. Try changing the
        fields below. Nothing is saved and nothing goes on the board.
      </p>

      {step !== "posted" && (
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
            {step === "hospital" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Where will this be done?</p>
                <p className="mt-1 text-caption text-ash">
                  Helps students find opportunities local to them. Try editing this to your own trust.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    aria-pressed={!isRemote}
                    onClick={() => setIsRemote(false)}
                    className={`${CHIP_BASE} ${!isRemote ? CHIP_ON : CHIP_OFF}`}
                  >
                    In person
                  </button>
                  <button
                    type="button"
                    aria-pressed={isRemote}
                    onClick={() => setIsRemote(true)}
                    className={`${CHIP_BASE} ${isRemote ? CHIP_ON : CHIP_OFF}`}
                  >
                    Remote / virtual
                  </button>
                </div>
                <div className="mt-4">
                  <label htmlFor="demo-hospital" className="block text-body-sm text-mist">
                    Hospital / trust{!isRemote && <span className="text-coral-red"> *</span>}
                  </label>
                  <input
                    id="demo-hospital"
                    type="text"
                    value={hospitalTrust}
                    onChange={(e) => setHospitalTrust(e.target.value)}
                    placeholder={isRemote ? "Optional for remote work" : "e.g. St Mary's Hospital"}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}

            {step === "basics" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">What type of opportunity?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TASK_TYPE_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={taskType === o.value}
                        onClick={() => setTaskType(o.value)}
                        className={`${CHIP_BASE} ${taskType === o.value ? CHIP_ON : CHIP_OFF}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="demo-title" className="block text-body-sm text-mist">Title</label>
                  <input
                    id="demo-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="demo-description" className="block text-body-sm text-mist">What a student would actually do</label>
                  <textarea
                    id="demo-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}

            {step === "requirements" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Required skills *</p>
                  <p className="mt-1 text-caption text-ash">Only what a student truly can&apos;t do the task without.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={requiredSkills.includes(o.value)}
                        onClick={() => setRequiredSkills((prev) => toggle(prev, o.value))}
                        className={`${CHIP_BASE} ${requiredSkills.includes(o.value) ? CHIP_ON : CHIP_OFF}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Preferred skills</p>
                  <p className="mt-1 text-caption text-ash">Nice-to-haves: boost ranking, don&apos;t exclude anyone.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={preferredSkills.includes(o.value)}
                        onClick={() => setPreferredSkills((prev) => toggle(prev, o.value))}
                        className={`${CHIP_BASE} ${preferredSkills.includes(o.value) ? CHIP_ON : CHIP_OFF}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="demo-experience" className="block text-body-sm text-mist">Experience level *</label>
                    <select
                      id="demo-experience"
                      className={INPUT_CLASS}
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    >
                      {EXPERIENCE_LEVEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-carbon">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="demo-stage" className="block text-body-sm text-mist">Minimum year / stage *</label>
                    <select
                      id="demo-stage"
                      className={INPUT_CLASS}
                      value={minYearOfStudy}
                      onChange={(e) => setMinYearOfStudy(e.target.value)}
                    >
                      {STAGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-carbon">
                          {o.label}+
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === "commitment" && (
              <div className="space-y-5">
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">How much time will this take?</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="demo-hours" className="block text-body-sm text-mist">Hours per week *</label>
                    <select
                      id="demo-hours"
                      className={INPUT_CLASS}
                      value={estimatedCommitment}
                      onChange={(e) => setEstimatedCommitment(e.target.value as AvailabilityHours)}
                    >
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-carbon">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="demo-duration" className="block text-body-sm text-mist">Total project duration</label>
                    <select id="demo-duration" className={INPUT_CLASS} value={duration} onChange={(e) => setDuration(e.target.value)}>
                      {PROJECT_DURATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.label} className="bg-carbon">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">This is what students will see</p>
                <p className="mt-1 text-caption text-ash">
                  The same card as on the board, so what you preview here is what they&apos;ll get.
                </p>
                <div className={`${DEMO_CARD_CLASS} mt-4 border-graphite bg-carbon`}>
                  <DemoCardBody title={title} location={location} facts={cardFacts} taskType={taskType} />
                </div>
                <div className="mt-3 rounded-cards border border-graphite bg-black/[0.015] p-5">
                  <p className="whitespace-pre-wrap text-body-sm text-mist">{description}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {requiredSkills.map((s) => (
                      <span key={s} className="rounded-badges bg-iris-violet/15 px-[6px] text-label text-iris-violet">
                        {SKILL_OPTIONS.find((o) => o.value === s)?.label}
                      </span>
                    ))}
                    {preferredSkills.map((s) => (
                      <span key={s} className="rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">
                        {SKILL_OPTIONS.find((o) => o.value === s)?.label} (preferred)
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 border-t border-graphite pt-4 text-body-sm sm:grid-cols-2">
                    <div>
                      <span className="text-fog">Commitment: </span>
                      <span className="text-mist">
                        {AVAILABILITY_OPTIONS.find((o) => o.value === estimatedCommitment)?.label} for {duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-fog">Minimum stage: </span>
                      <span className="text-mist">{stageLabel(minYearOfStudy)}+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "posted" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Who applied</p>
                <p className="mt-1 text-body-sm text-fog">
                  Three example applicants, ranked against the post you just wrote. Each one shows what
                  they meet and what they don&apos;t, so you can see why they&apos;re in that order. You
                  make every decision. Hitch never accepts anyone for you.
                </p>

                <div className={`${DEMO_CARD_CLASS} mt-6 border-graphite bg-carbon`}>
                  <DemoCardBody title={title} location={location} taskType={taskType} compact />
                </div>

                <ol className="mt-4 space-y-3">
                  {applicants.map((a, i) => {
                    const status = statuses[a.name];
                    const allMet = a.match.checks.every((c) => c.met);
                    const set = (s: DemoStatus) => setStatuses((prev) => ({ ...prev, [a.name]: s }));
                    return (
                      <li key={a.name} className="rounded-cards border border-graphite bg-carbon p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pills bg-black/[0.045] text-[13px] font-[600] text-fog"
                            >
                              {i + 1}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-[510] text-paper">
                                  <span className="sr-only">Ranked {i + 1}: </span>
                                  {a.name}
                                </p>
                                <span className="rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                                  {a.match.percent}% match
                                </span>
                              </div>
                              <p className="text-caption text-fog">{a.detail}</p>
                            </div>
                          </div>
                          {status && (
                            <span className={`shrink-0 rounded-badges px-[6px] text-label font-[510] ${STATUS_PILL[status]}`}>
                              {STATUS_LABEL[status]}
                            </span>
                          )}
                        </div>

                        {a.match.checks.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {a.match.checks.map((c) => {
                              const unmetRequired = c.required && !c.met;
                              return (
                                <li key={c.label} className="flex items-center gap-1.5 text-body-sm">
                                  <span
                                    aria-hidden
                                    className={c.met ? "text-pulse-green" : unmetRequired ? "text-coral-red" : "text-ash"}
                                  >
                                    {c.met ? "✓" : "○"}
                                  </span>
                                  <span className={c.met ? "text-mist" : unmetRequired ? "text-coral-red" : "text-ash"}>
                                    {c.label}
                                    {c.required && <span className="ml-1 text-label text-ash">(required)</span>}
                                    <span className="sr-only">{c.met ? ", met" : ", not met"}</span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {allMet && (
                          <p className="mt-2 text-body-sm font-[510] text-pulse-green">Every requirement met</p>
                        )}

                        {status === "accepted" && (
                          <p className="mt-3 rounded-inputs border border-pulse-green/40 bg-pulse-green/[0.06] p-3 text-body-sm text-mist">
                            In the real product you would now see their email address to arrange next steps.
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {status !== "shortlisted" && status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => set("shortlisted")}
                              className={`${ACTION_BTN} border border-graphite text-mist hover:border-smoke`}
                            >
                              Shortlist
                            </button>
                          )}
                          {status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => set("accepted")}
                              className={`${ACTION_BTN} bg-acid-lime font-[510] text-void hover:opacity-90`}
                            >
                              Accept
                            </button>
                          )}
                          {status !== "declined" && (
                            <button
                              type="button"
                              onClick={() => set("declined")}
                              className={`${ACTION_BTN} border border-coral-red/30 text-coral-red hover:border-coral-red/60`}
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <button
                  onClick={onSeeStudentSide}
                  className="mt-4 w-full rounded-cards border border-acid-lime/40 bg-acid-lime/[0.06] p-4 text-left transition-colors hover:border-acid-lime/70"
                >
                  <p className="text-[14px] font-[510] text-paper">See how a student finds this →</p>
                  <p className="mt-0.5 text-caption text-fog">
                    Switch to the applicant view. This exact posting will be waiting for them.
                  </p>
                </button>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={restart} variant="secondary" size="lg">
                    Restart demo
                  </Button>
                  <Button href="/marketplace/post" variant="primary" size="lg">
                    Post an opportunity
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step !== "posted" && (
          <div className="mt-8 flex items-center justify-between border-t border-graphite pt-6">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="min-h-[44px] rounded-buttons border border-graphite px-5 text-[14px] text-mist disabled:opacity-0"
            >
              Back
            </button>
            <button
              onClick={goNext}
              className="min-h-[44px] rounded-buttons bg-acid-lime px-5 text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
            >
              {step === "preview" ? "Post opportunity" : "Next"}
            </button>
          </div>
        )}
      </div>

      {step !== "posted" && (
        <p className="mt-4 text-center text-caption text-ash">
          <Link href="/" className="inline-flex min-h-[44px] items-center underline hover:text-fog">
            Skip the demo, go to Hitch
          </Link>
        </p>
      )}
    </main>
  );
}
