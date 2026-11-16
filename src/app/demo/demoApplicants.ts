import { computeMatch, type MatchProfile, type MatchResult, type OpportunityForMatch } from "@/lib/marketplace";
import { medSchoolYearLabel } from "@/lib/data/onboarding-options";
import { DEMO_STUDENT_NAME, DEMO_STUDENT_PROFILE } from "./demoStudentProfile";

// Made-up applicants for both demo flows. Their percentages are never typed in: each is
// computeMatch() against whatever post is on screen, the same code the board uses, so editing the
// post mid-demo re-ranks them and the two walkthroughs always agree.
export type DemoApplicant = { name: string; detail: string; profile: MatchProfile; isDemoStudent?: boolean };

export const DEMO_APPLICANTS: DemoApplicant[] = [
  {
    name: DEMO_STUDENT_NAME,
    detail: `${medSchoolYearLabel("4")} · Imperial College London · 2-5h/week`,
    profile: DEMO_STUDENT_PROFILE,
    isDemoStudent: true,
  },
  {
    name: "Jamie Patel",
    detail: `${medSchoolYearLabel("5")} · King's College London · 2-5h/week`,
    profile: {
      targetSpecialty: null,
      currentSpecialty: null,
      hospitalTrust: "King's College Hospital",
      preferredRegion: null,
      yearOfStudy: "5",
      grade: null,
      skills: ["data_collection", "excel", "literature_review"],
      qiExperience: "none",
      researchExperience: "data_collection",
      availabilityHours: "2-5h",
    },
  },
  {
    name: "Riya Kaur",
    detail: `${medSchoolYearLabel("3")} · UCL · 5-10h/week`,
    profile: {
      targetSpecialty: null,
      currentSpecialty: null,
      hospitalTrust: "Charing Cross Hospital",
      preferredRegion: null,
      yearOfStudy: "3",
      grade: null,
      // Each made-up applicant has one skill the others lack, so the three example posts rank
      // them differently rather than tying.
      skills: ["excel", "statistics", "governance_training"],
      qiExperience: "none",
      researchExperience: "none",
      availabilityHours: "5-10h",
    },
  },
];

export function rankDemoApplicants(
  opportunity: OpportunityForMatch
): (DemoApplicant & { match: MatchResult })[] {
  return DEMO_APPLICANTS.map((a) => ({ ...a, match: computeMatch(opportunity, a.profile) })).sort(
    (a, b) => b.match.percent - a.match.percent
  );
}
