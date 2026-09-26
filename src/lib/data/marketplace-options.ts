export type TaskType = "qip" | "audit" | "research" | "presentation" | "teaching" | "other";

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "qip", label: "Quality Improvement Project (QIP)" },
  { value: "audit", label: "Audit" },
  { value: "research", label: "Research / data work" },
  { value: "presentation", label: "Presentation / case write-up" },
  { value: "teaching", label: "Teaching support" },
  { value: "other", label: "Other" },
];

export type ExperienceLevel = "no_experience_needed" | "some_experience" | "experienced";

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "no_experience_needed", label: "No experience needed" },
  { value: "some_experience", label: "Some experience helpful" },
  { value: "experienced", label: "Looking for someone experienced" },
];

export type OpportunityStatus = "open" | "closed" | "filled";

export type ProjectDuration = "under_2_weeks" | "2_4_weeks" | "1_3_months" | "3_6_months" | "6_plus_months";

export const PROJECT_DURATION_OPTIONS: { value: ProjectDuration; label: string }[] = [
  { value: "under_2_weeks", label: "Under 2 weeks" },
  { value: "2_4_weeks", label: "2–4 weeks" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "6_plus_months", label: "6+ months" },
];

// Shared vocabulary used on both sides of the marketplace: a student's profile and a posting's
// required/preferred criteria are built from the same option lists, so matching can be exact
// rather than fuzzy free-text comparison.

export type Skill =
  | "excel"
  | "statistics"
  | "literature_review"
  | "data_collection"
  | "patient_recruitment"
  | "poster_presentation"
  | "manuscript_writing"
  | "governance_training";

export const SKILL_OPTIONS: { value: Skill; label: string }[] = [
  { value: "excel", label: "Excel / data management" },
  { value: "statistics", label: "Statistics (SPSS, R, Stata)" },
  { value: "literature_review", label: "Literature search / review" },
  { value: "data_collection", label: "Data collection / EPR extraction" },
  { value: "patient_recruitment", label: "Patient recruitment" },
  { value: "poster_presentation", label: "Poster / presentation" },
  { value: "manuscript_writing", label: "Manuscript writing" },
  { value: "governance_training", label: "Audit/QI or GCP training" },
];

export type QiExperience = "none" | "assisted" | "led";

export const QI_EXPERIENCE_OPTIONS: { value: QiExperience; label: string }[] = [
  { value: "none", label: "No QI experience yet" },
  { value: "assisted", label: "Assisted on a QI project" },
  { value: "led", label: "Led a QI project" },
];

export type ResearchExperience = "none" | "data_collection" | "analysis" | "manuscript";

export const RESEARCH_EXPERIENCE_OPTIONS: { value: ResearchExperience; label: string }[] = [
  { value: "none", label: "No research experience yet" },
  { value: "data_collection", label: "Data collection" },
  { value: "analysis", label: "Data analysis" },
  { value: "manuscript", label: "Manuscript / publication" },
];

export type AvailabilityHours = "<2h" | "2-5h" | "5-10h";

export const AVAILABILITY_OPTIONS: { value: AvailabilityHours; label: string }[] = [
  { value: "<2h", label: "Under 2 hours/week" },
  { value: "2-5h", label: "2–5 hours/week" },
  { value: "5-10h", label: "5–10 hours/week" },
];

// Ordinal rank so "led" satisfies a requirement of "assisted", "5-10h" satisfies "2-5h", etc.
export const QI_EXPERIENCE_RANK: Record<QiExperience, number> = { none: 0, assisted: 1, led: 2 };
export const RESEARCH_EXPERIENCE_RANK: Record<ResearchExperience, number> = {
  none: 0,
  data_collection: 1,
  analysis: 2,
  manuscript: 3,
};
export const AVAILABILITY_RANK: Record<AvailabilityHours, number> = { "<2h": 0, "2-5h": 1, "5-10h": 2 };
