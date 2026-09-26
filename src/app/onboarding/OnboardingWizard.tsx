"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toastQueue } from "@/components/Toast";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { isDemoMode } from "@/lib/demoMode";
import { UK_MEDICAL_SCHOOLS } from "@/lib/data/uk-medical-schools";
import {
  ONBOARDING_ROLES,
  DOCTOR_STAGES,
  SPECIALTY_TRAINING_YEARS,
  MED_SCHOOL_YEARS,
  medSchoolYearLabel,
  type OnboardingRole,
} from "@/lib/data/onboarding-options";
import { UK_DEANERIES } from "@/lib/data/deaneries";
import { PRIORITY_SPECIALTIES } from "@/lib/data/all-specialty-ratios";
import {
  SKILL_OPTIONS,
  QI_EXPERIENCE_OPTIONS,
  RESEARCH_EXPERIENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
  type Skill,
  type QiExperience,
  type ResearchExperience,
  type AvailabilityHours,
} from "@/lib/data/marketplace-options";

const SPECIALTY_OPTIONS = [...PRIORITY_SPECIALTIES, "Other", "Not sure yet"];
const CURRENT_SPECIALTY_OPTIONS = [...PRIORITY_SPECIALTIES, "Other"];

type Role = OnboardingRole["value"];

type FormState = {
  role: Role | null;
  medSchool: string;
  yearOfStudy: string;
  preferredRegion: string;
  grade: string;
  currentSpecialty: string;
  currentSpecialtyYear: string;
  hospitalTrust: string;
  department: string;
  gmcNumber: string;
  targetSpecialty: string;
  qiExperience: QiExperience | "";
  researchExperience: ResearchExperience | "";
  skills: Skill[];
  availabilityHours: AvailabilityHours | "";
};

const EMPTY_FORM: FormState = {
  role: null,
  medSchool: "",
  yearOfStudy: "",
  preferredRegion: "",
  grade: "",
  currentSpecialty: "",
  currentSpecialtyYear: "",
  hospitalTrust: "",
  department: "",
  gmcNumber: "",
  targetSpecialty: "",
  qiExperience: "",
  researchExperience: "",
  skills: [],
  availabilityHours: "",
};

// Both applicant roles (students and foundation doctors alike apply to QIP/audit/research
// postings) get the same structured matching steps at the end, so posters can match against one
// consistent vocabulary regardless of which role applied.
const MATCHING_STEPS = ["qi_experience", "research_experience", "skills", "availability_hours"];

function stepsForRole(role: Role | null, grade: string): string[] {
  if (role === "medical_student") {
    return ["role", "med_school", "year_of_study", "target_specialty", ...MATCHING_STEPS];
  }
  if (role === "doctor_applicant") {
    const base = ["role", "preferred_region", "grade"];
    if (grade === "IN_SPECIALTY_TRAINING") base.push("current_specialty", "current_specialty_year");
    return [...base, "hospital_trust", "target_specialty", ...MATCHING_STEPS];
  }
  if (role === "consultant_registrar") {
    return ["role", "preferred_region", "hospital_trust", "department", "gmc_number"];
  }
  return ["role"];
}

function guessRoleFromEmail(email: string | undefined): Role | null {
  if (!email) return null;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "ac.uk" || domain.endsWith(".ac.uk")) return "medical_student";
  return null;
}

const CARD = "rounded-cards bg-carbon p-8 shadow-subtle";
const SELECT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none";

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 16 : -16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -16 : 16 }),
};

const OPTION_SPRING = { type: "spring", bounce: 0.2, visualDuration: 0.3 } as const;

export default function OnboardingWizard() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isDemoMode()) {
          setDemo(true);
          setLoading(false);
          return;
        }
        router.replace("/login");
        return;
      }
      setForm((prev) => ({ ...prev, role: prev.role ?? guessRoleFromEmail(user.email) }));
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  const steps = stepsForRole(form.role, form.grade);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex >= steps.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    switch (currentStep) {
      case "role":
        return form.role !== null;
      case "med_school":
        return form.medSchool !== "";
      case "year_of_study":
        return form.yearOfStudy !== "";
      case "preferred_region":
        return form.preferredRegion !== "";
      case "grade":
        return form.grade !== "";
      case "current_specialty":
        return form.currentSpecialty !== "";
      case "current_specialty_year":
        return form.currentSpecialtyYear !== "";
      case "hospital_trust":
        return true; // optional / skippable
      case "department":
        return form.department.trim() !== "";
      case "gmc_number":
        return true; // optional / skippable
      case "target_specialty":
        return form.targetSpecialty !== "";
      case "qi_experience":
        return form.qiExperience !== "";
      case "research_experience":
        return form.researchExperience !== "";
      case "skills":
        return true; // optional / skippable
      case "availability_hours":
        return form.availabilityHours !== "";
      default:
        return false;
    }
  }

  function toggleSkill(skill: Skill) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  }

  async function handleNext() {
    if (isLastStep) {
      await handleSubmit();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    setDirection(-1);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleSubmit() {
    setSaving(true);

    if (demo) {
      // Demo mode: walk through the real flow and routing, but there's no real user to
      // attach data to, so skip the write rather than fail silently against RLS.
      setSaving(false);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const inSpecialtyTraining = form.role === "doctor_applicant" && form.grade === "IN_SPECIALTY_TRAINING";

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        role: form.role,
        med_school: form.role === "medical_student" ? form.medSchool : null,
        year_of_study: form.role === "medical_student" ? form.yearOfStudy : null,
        preferred_region: form.role !== "medical_student" ? form.preferredRegion : null,
        grade: form.role === "doctor_applicant" ? form.grade : null,
        current_specialty: inSpecialtyTraining ? form.currentSpecialty : null,
        current_specialty_year: inSpecialtyTraining ? form.currentSpecialtyYear : null,
        hospital_trust: form.role !== "medical_student" ? form.hospitalTrust || null : null,
        department: form.role === "consultant_registrar" ? form.department : null,
        gmc_number: form.role === "consultant_registrar" ? form.gmcNumber || null : null,
        target_specialty: form.role !== "consultant_registrar" ? form.targetSpecialty : null,
        qi_experience: form.role !== "consultant_registrar" ? form.qiExperience || null : null,
        research_experience: form.role !== "consultant_registrar" ? form.researchExperience || null : null,
        skills: form.role !== "consultant_registrar" ? form.skills : null,
        availability_hours: form.role !== "consultant_registrar" ? form.availabilityHours || null : null,
        onboarding_completed_at: new Date().toISOString(),
      });

      setSaving(false);
    }

    if (form.role === "consultant_registrar") {
      setDone(true);
      return;
    }

    toastQueue.add({
      title: "You're all set",
      description: "Your profile is ready — let's find you an opportunity.",
    });

    router.push("/marketplace");
  }

  if (loading) {
    return <div className={`${CARD} mt-8`}>Loading…</div>;
  }

  if (done) {
    return (
      <div className={`${CARD} mt-8`}>
        <h2 className="text-[17px] font-[510] text-paper">You&apos;re set up</h2>
        <p className="mt-2 text-body-sm text-fog">
          You can post a QIP, audit, or research opportunity now — students and foundation
          doctors will see it and apply directly.
        </p>
        <button
          onClick={() => router.push("/marketplace/post")}
          className="mt-6 rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
        >
          Post an opportunity →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {demo && (
        <p className="mb-2 inline-block rounded-badges bg-acid-lime/15 px-[6px] text-label text-acid-lime">
          Demo mode — nothing here is saved
        </p>
      )}
      <div className="flex items-center gap-3">
        <p className="text-caption text-ash">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <div className="h-1 max-w-24 flex-1 overflow-hidden rounded-pills bg-graphite">
          <motion.div
            className="h-full rounded-pills bg-acid-lime"
            animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      <div className={`${CARD} mt-2 overflow-hidden`}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {currentStep === "role" && (
              <StepShell question="Are you a medical student or a doctor?">
                <div className="space-y-2">
                  {ONBOARDING_ROLES.map((r) => (
                    <OptionButton
                      key={r.value}
                      selected={form.role === r.value}
                      onClick={() => update("role", r.value)}
                      layoutId="role-highlight"
                    >
                      <span>
                        <span className="block font-[510] text-paper">{r.label}</span>
                        <span className="block text-caption text-fog">{r.description}</span>
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "med_school" && (
              <StepShell question="Which medical school?">
                <SearchSelect
                  options={UK_MEDICAL_SCHOOLS}
                  value={form.medSchool}
                  onValueChange={(v) => update("medSchool", v)}
                  type="medical school"
                />
              </StepShell>
            )}

            {currentStep === "year_of_study" && (
              <StepShell question="What year are you in?">
                <div className="grid grid-cols-3 gap-2">
                  {MED_SCHOOL_YEARS.map((y) => (
                    <OptionButton
                      key={y}
                      selected={form.yearOfStudy === y}
                      onClick={() => update("yearOfStudy", y)}
                      layoutId="year-highlight"
                      center
                    >
                      <span className={form.yearOfStudy === y ? "text-paper" : "text-mist"}>
                        {medSchoolYearLabel(y)}
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "preferred_region" && (
              <StepShell question="Which deanery / region are you in?">
                <SearchSelect
                  options={UK_DEANERIES}
                  value={form.preferredRegion}
                  onValueChange={(v) => update("preferredRegion", v)}
                  type="deanery or region"
                />
              </StepShell>
            )}

            {currentStep === "grade" && (
              <StepShell question="What stage are you at?">
                <div className="space-y-2">
                  {DOCTOR_STAGES.map((g) => (
                    <OptionButton
                      key={g.value}
                      selected={form.grade === g.value}
                      onClick={() => update("grade", g.value)}
                      layoutId="grade-highlight"
                    >
                      <span className={form.grade === g.value ? "text-paper" : "text-mist"}>{g.label}</span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "current_specialty" && (
              <StepShell question="Which specialty are you currently training in?">
                <SearchSelect
                  options={CURRENT_SPECIALTY_OPTIONS}
                  value={form.currentSpecialty}
                  onValueChange={(v) => update("currentSpecialty", v)}
                  type="specialty"
                />
              </StepShell>
            )}

            {currentStep === "current_specialty_year" && (
              <StepShell question={`What year of ${form.currentSpecialty || "training"} are you in?`}>
                <div className="grid grid-cols-3 gap-2">
                  {SPECIALTY_TRAINING_YEARS.map((y) => (
                    <OptionButton
                      key={y}
                      selected={form.currentSpecialtyYear === y}
                      onClick={() => update("currentSpecialtyYear", y)}
                      layoutId="specialty-year-highlight"
                      center
                    >
                      <span className={form.currentSpecialtyYear === y ? "text-paper" : "text-mist"}>{y}</span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "hospital_trust" && (
              <StepShell question="Which hospital or trust?" hint="Optional — helps with local opportunity matching later.">
                <input
                  type="text"
                  value={form.hospitalTrust}
                  onChange={(e) => update("hospitalTrust", e.target.value)}
                  placeholder="e.g. Chelsea and Westminster Hospital NHS Foundation Trust"
                  className={SELECT_CLASS}
                />
              </StepShell>
            )}

            {currentStep === "department" && (
              <StepShell question="Which specialty or department?">
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  placeholder="e.g. Internal Medicine, General Surgery, Paediatrics"
                  className={SELECT_CLASS}
                />
              </StepShell>
            )}

            {currentStep === "gmc_number" && (
              <StepShell question="What's your GMC number?">
                <input
                  type="text"
                  value={form.gmcNumber}
                  onChange={(e) => update("gmcNumber", e.target.value)}
                  placeholder="Optional — a public register number, shown to applicants as a trust signal"
                  className={SELECT_CLASS}
                />
              </StepShell>
            )}

            {currentStep === "target_specialty" && (
              <StepShell question="What specialty are you aiming for?">
                <SearchSelect
                  options={SPECIALTY_OPTIONS}
                  value={form.targetSpecialty}
                  onValueChange={(v) => update("targetSpecialty", v)}
                  type="specialty"
                />
              </StepShell>
            )}

            {currentStep === "qi_experience" && (
              <StepShell question="Have you been involved in a QI project before?">
                <div className="space-y-2">
                  {QI_EXPERIENCE_OPTIONS.map((o) => (
                    <OptionButton
                      key={o.value}
                      selected={form.qiExperience === o.value}
                      onClick={() => update("qiExperience", o.value)}
                      layoutId="qi-experience-highlight"
                    >
                      <span className={form.qiExperience === o.value ? "text-paper" : "text-mist"}>{o.label}</span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "research_experience" && (
              <StepShell question="Have you done research before?">
                <div className="space-y-2">
                  {RESEARCH_EXPERIENCE_OPTIONS.map((o) => (
                    <OptionButton
                      key={o.value}
                      selected={form.researchExperience === o.value}
                      onClick={() => update("researchExperience", o.value)}
                      layoutId="research-experience-highlight"
                    >
                      <span className={form.researchExperience === o.value ? "text-paper" : "text-mist"}>
                        {o.label}
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "skills" && (
              <StepShell
                question="Which of these can you already do?"
                hint="Optional — helps you match with the right opportunities. Pick as many as apply."
              >
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((o) => {
                    const selected = form.skills.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleSkill(o.value)}
                        className={`rounded-pills border px-4 py-2 text-body-sm transition-colors ${
                          selected ? "border-acid-lime bg-acid-lime/10 text-paper" : "border-graphite text-mist hover:border-smoke"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {currentStep === "availability_hours" && (
              <StepShell question="How many hours a week could you commit?">
                <div className="space-y-2">
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <OptionButton
                      key={o.value}
                      selected={form.availabilityHours === o.value}
                      onClick={() => update("availabilityHours", o.value)}
                      layoutId="availability-highlight"
                    >
                      <span className={form.availabilityHours === o.value ? "text-paper" : "text-mist"}>
                        {o.label}
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist disabled:opacity-0"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance() || saving}
            className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  layoutId,
  center = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  layoutId: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative flex w-full items-center overflow-hidden rounded-inputs border p-4 text-left text-body-sm transition-colors ${
        center ? "justify-center" : "justify-between"
      } ${selected ? "border-acid-lime" : "border-graphite hover:border-smoke"}`}
    >
      {selected && (
        <motion.div layoutId={layoutId} transition={OPTION_SPRING} className="absolute inset-0 bg-acid-lime/10" />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

function SearchSelect({
  options,
  value,
  onValueChange,
  type,
}: {
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  type: string;
}) {
  const data = options.map((o) => ({ label: o, value: o }));
  return (
    <Combobox data={data} type={type} value={value} onValueChange={onValueChange}>
      <ComboboxTrigger />
      <ComboboxContent>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          <ComboboxGroup>
            {data.map((item) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function StepShell({
  question,
  hint,
  children,
}: {
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[20px] font-[510] tracking-[-0.24px] text-paper">{question}</h2>
      {hint && <p className="mt-1 text-caption text-ash">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
