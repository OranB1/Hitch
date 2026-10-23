import { LONDON_MED_SCHOOL_HOSPITAL_PARTNERSHIPS } from "@/lib/data/medical-school-hospital-partnerships";
import {
  SKILL_OPTIONS,
  QI_EXPERIENCE_RANK,
  RESEARCH_EXPERIENCE_RANK,
  AVAILABILITY_RANK,
  type Skill,
  type QiExperience,
  type ResearchExperience,
  type AvailabilityHours,
} from "@/lib/data/marketplace-options";
import { STAGE_RANK, stageLabel, type Stage } from "@/lib/data/onboarding-options";

export function getPartneredHospitals(medSchool: string | null): string[] {
  if (!medSchool) return [];
  const entry = LONDON_MED_SCHOOL_HOSPITAL_PARTNERSHIPS.find((p) => p.medSchool === medSchool);
  return entry?.hospitals ?? [];
}

export type MatchProfile = {
  targetSpecialty: string | null;
  currentSpecialty: string | null;
  hospitalTrust: string | null;
  preferredRegion: string | null;
  yearOfStudy: string | null;
  grade: string | null;
  skills: Skill[] | null;
  qiExperience: QiExperience | null;
  researchExperience: ResearchExperience | null;
  availabilityHours: AvailabilityHours | null;
};

export type OpportunityForMatch = {
  specialty: string | null;
  hospital_trust: string | null;
  deanery_region: string | null;
  min_year_of_study: string | null;
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  experience_level: string | null;
  estimated_commitment: string | null;
};

export type MatchCheck = { label: string; met: boolean; required: boolean };

export type MatchResult = { percent: number; checks: MatchCheck[] };

const EXPERIENCE_LEVEL_THRESHOLD: Record<string, number> = {
  no_experience_needed: 0,
  some_experience: 1,
  experienced: 2,
};

function skillLabel(value: string): string {
  return SKILL_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

// Explainable, deterministic weighted score, no opaque ranking. Each criterion the opportunity
// actually specifies contributes its listed weight; unspecified criteria are dropped and the
// remaining weights renormalized to 100%, so a sparse posting isn't penalised for fields it
// never asked about.
export function computeMatch(opportunity: OpportunityForMatch, profile: MatchProfile): MatchResult {
  const checks: MatchCheck[] = [];
  let earnedWeight = 0;
  let totalWeight = 0;

  // Specialty interest: 15%
  if (opportunity.specialty) {
    const studentSpecialty = profile.targetSpecialty ?? profile.currentSpecialty;
    const met = !!studentSpecialty && studentSpecialty.toLowerCase() === opportunity.specialty.toLowerCase();
    checks.push({ label: `Interested in ${opportunity.specialty}`, met, required: false });
    totalWeight += 15;
    if (met) earnedWeight += 15;
  }

  // Relevant skills: 30%, required skills weighted 2x preferred within that budget
  const required = opportunity.required_skills ?? [];
  const preferred = opportunity.preferred_skills ?? [];
  if (required.length || preferred.length) {
    const studentSkills = new Set(profile.skills ?? []);
    let skillWeight = 0;
    let skillEarned = 0;
    for (const s of required) {
      const met = studentSkills.has(s as Skill);
      checks.push({ label: skillLabel(s), met, required: true });
      skillWeight += 2;
      if (met) skillEarned += 2;
    }
    for (const s of preferred) {
      const met = studentSkills.has(s as Skill);
      checks.push({ label: skillLabel(s), met, required: false });
      skillWeight += 1;
      if (met) skillEarned += 1;
    }
    totalWeight += 30;
    if (skillWeight > 0) earnedWeight += (skillEarned / skillWeight) * 30;
  }

  // Previous experience: 20%
  if (opportunity.experience_level && opportunity.experience_level in EXPERIENCE_LEVEL_THRESHOLD) {
    const threshold = EXPERIENCE_LEVEL_THRESHOLD[opportunity.experience_level];
    const qiRank = profile.qiExperience ? QI_EXPERIENCE_RANK[profile.qiExperience] : 0;
    const researchRank = profile.researchExperience
      ? Math.min(2, RESEARCH_EXPERIENCE_RANK[profile.researchExperience])
      : 0;
    const met = Math.max(qiRank, researchRank) >= threshold;
    checks.push({
      label:
        threshold === 0
          ? "No experience needed"
          : threshold === 1
            ? "Some QI/research experience"
            : "Experienced with QI/research",
      met,
      required: false,
    });
    totalWeight += 20;
    if (met) earnedWeight += 20;
  }

  // Availability: 20%
  if (opportunity.estimated_commitment && opportunity.estimated_commitment in AVAILABILITY_RANK) {
    const requiredRank = AVAILABILITY_RANK[opportunity.estimated_commitment as AvailabilityHours];
    const studentRank = profile.availabilityHours ? AVAILABILITY_RANK[profile.availabilityHours] : -1;
    const met = studentRank >= requiredRank;
    checks.push({ label: `Available ${opportunity.estimated_commitment}/week`, met, required: false });
    totalWeight += 20;
    if (met) earnedWeight += 20;
  }

  // Location: 15%
  if (opportunity.hospital_trust || opportunity.deanery_region) {
    const hospitalMet =
      !!opportunity.hospital_trust &&
      !!profile.hospitalTrust &&
      profile.hospitalTrust.toLowerCase().includes(opportunity.hospital_trust.toLowerCase());
    const regionMet = !!opportunity.deanery_region && profile.preferredRegion === opportunity.deanery_region;
    const met = hospitalMet || regionMet;
    checks.push({
      label: opportunity.hospital_trust ?? opportunity.deanery_region ?? "Location",
      met,
      required: false,
    });
    totalWeight += 15;
    if (met) earnedWeight += 15;
  }

  // Minimum stage: 10%, compared ordinally (a combined med-school-year + foundation-year scale)
  // rather than by free-text substring, since "3rd year" never substring-matches a stored "3".
  if (opportunity.min_year_of_study && opportunity.min_year_of_study in STAGE_RANK) {
    const minRank = STAGE_RANK[opportunity.min_year_of_study as Stage];
    const studentStage = profile.yearOfStudy ?? profile.grade;
    const studentRank = studentStage && studentStage in STAGE_RANK ? STAGE_RANK[studentStage as Stage] : -1;
    const met = studentRank >= minRank;
    checks.unshift({ label: `${stageLabel(opportunity.min_year_of_study)}+`, met, required: true });
    totalWeight += 10;
    if (met) earnedWeight += 10;
  }

  const percent = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
  return { percent, checks };
}
