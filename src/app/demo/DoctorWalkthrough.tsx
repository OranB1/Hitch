"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, User, Building2, ClipboardList, ListChecks, Clock, Eye } from "lucide-react";
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
import { computeMatch } from "@/lib/marketplace";
import { STAGE_OPTIONS, stageLabel } from "@/lib/data/onboarding-options";
import { DEMO_STUDENT_PROFILE } from "./demoStudentProfile";
import type { PostedOpportunity } from "./types";

const STEPS = ["profile", "hospital", "basics", "requirements", "commitment", "preview", "posted"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  profile: "Your details",
  hospital: "Your hospital",
  basics: "What are you posting?",
  requirements: "What do you need?",
  commitment: "Commitment",
  preview: "Preview",
  posted: "Posted",
};

const STEP_ICON: Record<Step, React.ComponentType<{ size?: number }>> = {
  profile: User,
  hospital: Building2,
  basics: ClipboardList,
  requirements: ListChecks,
  commitment: Clock,
  preview: Eye,
  posted: Eye,
};

// Fictional trusts and figures: deliberately not naming any real NHS trust here, since this is
// an illustrative "coming soon" mockup, not real data.
const CROSS_TRUST_TEASER = [
  {
    trust: "A London teaching hospital trust",
    title: "Cutting surgical-site infections on colorectal wards",
    stat: "Illustrative example",
  },
  {
    trust: "A regional acute trust",
    title: "Standardising discharge summaries in acute medicine",
    stat: "Illustrative example",
  },
  {
    trust: "A district general hospital",
    title: "Improving VTE prophylaxis prescribing on admission",
    stat: "Illustrative example",
  },
];

const CARD = "rounded-cards bg-carbon p-6 shadow-subtle sm:p-8";
const INPUT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none";
const CHIP_BASE = "rounded-pills border px-3 py-[7px] text-[13px] transition-colors";
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

  const [hospitalTrust, setHospitalTrust] = useState("Chelsea and Westminster Hospital NHS Foundation Trust");
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
  }

  const taskTypeLabel = TASK_TYPE_OPTIONS.find((t) => t.value === taskType)?.label ?? taskType;
  const matchPercent = computeMatch(
    {
      specialty: null,
      hospital_trust: hospitalTrust,
      deanery_region: null,
      min_year_of_study: minYearOfStudy,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      experience_level: experienceLevel,
      estimated_commitment: estimatedCommitment,
    },
    DEMO_STUDENT_PROFILE
  ).percent;

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
        Posting an opportunity, as a doctor
      </h1>
      <p className="mt-2 text-body-sm text-fog">
        This is exactly what it looks like for a consultant, registrar, or QI lead to post a real
        opportunity on Hitch. Try changing the fields below, it&apos;s the real posting form,
        just without needing to sign in.
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
            {step === "profile" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Who&apos;s posting</p>
                <p className="mt-1 text-caption text-ash">
                  Pulled automatically from your Hitch profile. Nothing to fill in here.
                </p>
                <div className="mt-5 flex items-center gap-4 rounded-inputs border border-graphite bg-black/[0.02] p-4">
                  <div className="h-12 w-12 shrink-0 rounded-pills bg-iris-violet/15 flex items-center justify-center text-[17px] font-[510] text-iris-violet">
                    AO
                  </div>
                  <div>
                    <p className="font-[510] text-paper">Dr. Amara Okafor</p>
                    <p className="text-caption text-fog">Consultant, Cardiothoracic Surgery</p>
                  </div>
                </div>
              </div>
            )}

            {step === "hospital" && (
              <div>
                <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Where will this be done?</p>
                <p className="mt-1 text-caption text-ash">
                  Helps students find opportunities local to them. Try editing this to your own trust.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRemote(false)}
                    className={`${CHIP_BASE} ${!isRemote ? CHIP_ON : CHIP_OFF}`}
                  >
                    In person
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRemote(true)}
                    className={`${CHIP_BASE} ${isRemote ? CHIP_ON : CHIP_OFF}`}
                  >
                    Remote / virtual
                  </button>
                </div>
                <div className="mt-4">
                  <label className="block text-body-sm text-mist">
                    Hospital / trust{!isRemote && <span className="text-coral-red"> *</span>}
                  </label>
                  <input
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
                        onClick={() => setTaskType(o.value)}
                        className={`${CHIP_BASE} ${taskType === o.value ? CHIP_ON : CHIP_OFF}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-body-sm text-mist">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-mist">What a student would actually do</label>
                  <textarea
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
                    <label className="block text-body-sm text-mist">Experience level *</label>
                    <select
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
                    <label className="block text-body-sm text-mist">Minimum year / stage *</label>
                    <select
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
                    <label className="block text-body-sm text-mist">Hours per week *</label>
                    <select
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
                    <label className="block text-body-sm text-mist">Total project duration</label>
                    <select className={INPUT_CLASS} value={duration} onChange={(e) => setDuration(e.target.value)}>
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
                <div className="mt-4 rounded-cards border border-graphite bg-black/[0.015] p-5">
                  <p className="font-[510] text-paper">{title}</p>
                  <p className="mt-1 text-caption text-fog">
                    {isRemote ? "Remote / virtual" : hospitalTrust || "Location not specified"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">{taskTypeLabel}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-body-sm text-mist">{description}</p>
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
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pulse-green" />
                  <p className="text-[20px] font-[510] tracking-[-0.24px] text-paper">Your opportunity is live</p>
                </div>
                <p className="mt-1 text-body-sm text-fog">
                  {isRemote
                    ? "Students and foundation doctors looking for remote work can see and apply to this now. You'll see a ranked shortlist as applications come in."
                    : `Students and foundation doctors near ${hospitalTrust.split(" NHS")[0]} can see and apply to this now. You'll see a ranked shortlist as applications come in.`}
                </p>

                <div className="mt-6 rounded-cards border border-graphite bg-black/[0.015] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-[510] text-paper">{title}</p>
                    <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                      {matchPercent}% match
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-fog">
                    {isRemote ? "Remote / virtual" : hospitalTrust || "Location not specified"}
                  </p>
                </div>

                <button
                  onClick={onSeeStudentSide}
                  className="mt-4 w-full rounded-cards border border-acid-lime/40 bg-acid-lime/[0.06] p-4 text-left transition-colors hover:border-acid-lime/70"
                >
                  <p className="text-[14px] font-[510] text-paper">See how a student finds this →</p>
                  <p className="mt-0.5 text-caption text-fog">
                    Switch to the applicant view. This exact posting will be waiting for them.
                  </p>
                </button>

                <div className="mt-6 rounded-cards border border-dashed border-graphite p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-badges bg-signal-teal/15 px-[6px] text-label font-[510] text-signal-teal">
                      Coming soon
                    </span>
                    <p className="text-[14px] font-[510] text-paper">See what other trusts are running</p>
                  </div>
                  <p className="mt-1 text-caption text-ash">
                    Cross-trust visibility, so you can see what&apos;s worked elsewhere before starting
                    from scratch.
                  </p>
                  <div className="mt-4 space-y-2 opacity-60">
                    {CROSS_TRUST_TEASER.map((t) => (
                      <div key={t.title} className="rounded-inputs border border-graphite bg-black/[0.02] p-3">
                        <p className="text-body-sm font-[510] text-mist">{t.title}</p>
                        <p className="text-caption text-ash">
                          {t.trust} · {t.stat}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={restart} variant="secondary">
                    Restart demo
                  </Button>
                  <Button href="/marketplace/post" variant="primary">
                    Post a real opportunity
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
              className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist disabled:opacity-0"
            >
              Back
            </button>
            <button
              onClick={goNext}
              className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
            >
              {step === "preview" ? "Post opportunity" : "Next"}
            </button>
          </div>
        )}
      </div>

      {step !== "posted" && (
        <p className="mt-4 text-center text-caption text-ash">
          <Link href="/" className="underline hover:text-fog">
            Skip the demo, go to Hitch
          </Link>
        </p>
      )}
    </main>
  );
}
