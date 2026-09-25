export type DoctorStage = {
  value: string;
  label: string;
};

// F3/F4 included since not every foundation doctor goes straight into specialty training after
// F2. "In specialty training" is deliberately generic (not "IMT Year 1/2/3") — a doctor could be
// in any specialty's training programme, which is captured separately via currentSpecialty.
export const DOCTOR_STAGES: DoctorStage[] = [
  { value: "F1", label: "Foundation Year 1 (F1)" },
  { value: "F2", label: "Foundation Year 2 (F2)" },
  { value: "F3", label: "Foundation Year 3 (F3)" },
  { value: "F4", label: "Foundation Year 4 (F4)" },
  { value: "IN_SPECIALTY_TRAINING", label: "In specialty training" },
  { value: "OTHER", label: "Other" },
];

export const SPECIALTY_TRAINING_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5+"];

export const MED_SCHOOL_YEARS = ["1", "2", "3", "4", "5", "Intercalating"];

const MED_SCHOOL_YEAR_LABELS: Record<string, string> = {
  "1": "First year",
  "2": "Second year",
  "3": "Third year",
  "4": "Fourth year",
  "5": "Fifth year",
  Intercalating: "Intercalating",
};

export function medSchoolYearLabel(value: string): string {
  return MED_SCHOOL_YEAR_LABELS[value] ?? value;
}

// A single ordered stage list spanning both applicant profile shapes (a medical student's
// year_of_study and a doctor's grade), so a posting's "minimum stage" can be compared against
// either kind of applicant with one ordinal ranking instead of free-text substring matching.
export type Stage = "1" | "2" | "3" | "4" | "5" | "Intercalating" | "F1" | "F2" | "F3" | "F4" | "IN_SPECIALTY_TRAINING";

export const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: "1", label: "1st year (med school)" },
  { value: "2", label: "2nd year (med school)" },
  { value: "3", label: "3rd year (med school)" },
  { value: "4", label: "4th year (med school)" },
  { value: "5", label: "5th year (med school)" },
  { value: "Intercalating", label: "Intercalating" },
  { value: "F1", label: "F1" },
  { value: "F2", label: "F2" },
  { value: "F3", label: "F3" },
  { value: "F4", label: "F4" },
  { value: "IN_SPECIALTY_TRAINING", label: "In specialty training" },
];

export const STAGE_RANK: Record<Stage, number> = Object.fromEntries(
  STAGE_OPTIONS.map((o, i) => [o.value, i])
) as Record<Stage, number>;

export function stageLabel(value: string): string {
  return STAGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export type OnboardingRole = {
  value: "medical_student" | "doctor_applicant" | "consultant_registrar";
  label: string;
  description: string;
};

export const ONBOARDING_ROLES: OnboardingRole[] = [
  {
    value: "medical_student",
    label: "Medical student",
    description: "Building a portfolio toward specialty training applications",
  },
  {
    value: "doctor_applicant",
    label: "Foundation doctor / IMT trainee",
    description: "Applying to specialty training (F1, F2, or IMT)",
  },
  {
    value: "consultant_registrar",
    label: "Consultant or registrar",
    description: "Here to post QIP, audit, or research opportunities for others",
  },
];

export type Intent = {
  value: string;
  label: string;
};

export const APPLICANT_INTENTS: Intent[] = [
  { value: "check_likelihood", label: "Check my offer likelihood" },
  { value: "score_portfolio", label: "Score my portfolio" },
  { value: "explore", label: "Just exploring" },
];
