import type { MatchProfile } from "@/lib/marketplace";
import type { Skill } from "@/lib/data/marketplace-options";
import { medSchoolYearLabel } from "@/lib/data/onboarding-options";

// A single fixed persona shared by both demo flows, so the match % shown on the doctor's
// "posted" screen and the match % shown in the student's browse view are computed from the same
// profile and always agree. Critical when both flows get shown back-to-back live.
export const DEMO_STUDENT_NAME = "Sam Okonkwo";
export const DEMO_STUDENT_SUBTITLE = `${medSchoolYearLabel("4")} · Imperial College London · Cardiothoracic Surgery interest`;

export const DEMO_STUDENT_SKILLS: Skill[] = ["excel", "statistics", "data_collection"];

export const DEMO_STUDENT_PROFILE: MatchProfile = {
  targetSpecialty: "Cardiothoracic Surgery ST1",
  currentSpecialty: null,
  hospitalTrust: "Chelsea and Westminster Hospital NHS Foundation Trust",
  preferredRegion: null,
  yearOfStudy: "4",
  grade: null,
  skills: DEMO_STUDENT_SKILLS,
  qiExperience: "assisted",
  researchExperience: "data_collection",
  availabilityHours: "2-5h",
};
