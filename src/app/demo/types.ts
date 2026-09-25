import type { Skill, TaskType, ExperienceLevel, AvailabilityHours } from "@/lib/data/marketplace-options";

export type PostedOpportunity = {
  title: string;
  description: string;
  hospitalTrust: string;
  isRemote: boolean;
  taskType: TaskType;
  requiredSkills: Skill[];
  preferredSkills: Skill[];
  experienceLevel: ExperienceLevel;
  minYearOfStudy: string;
  estimatedCommitment: AvailabilityHours;
  durationLabel: string;
};
